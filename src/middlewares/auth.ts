import { User } from '../models/user/User';
import { Middleware } from '../types/common';
import { User as UserInterface, RegisteredClub } from '../types/user';
import { Method, Role } from '../types/common';
import { Validation } from '../models/validation/validation';
import { Validation as ValidationInterface } from '../types/validation';

export const auth: Middleware = (req, res, next) => {
  const token = req.cookies.x_auth;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res
        .status(401)
        .json({ status: 'fail', error: '인증 정보가 없습니다' });
    req.body.authToken = token;
    req.body.authUser = user;
    next();
  });
};

export const authByClub: Middleware = (req, res, next) => {
  const token = req.cookies.x_auth;
  const clubId = req.params.clubId;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res
        .status(401)
        .json({ status: 'fail', error: '인증 정보가 없습니다' });
    const identifiedUser: any = user;
    if (identifiedUser.registeredClubs.get(String(clubId))) next();
    else {
      res.status(403).json({
        status: 'fail',
        error: '인증 정보가 해당 동아리에 속하지 않습니다.',
      });
    }
  });
};

//auth 미들웨어를 통과한 이후 시행해야함
export const authBySuperUser: Middleware = (req, res, next) => {
  const user: UserInterface = req.body.authUser;
  if (process.env.SUPER_USERS?.includes(user.userID)) {
    next();
  } else {
    res
      .status(403)
      .json({ status: 'fail', error: '관리자만 수행할 수 있는 기능입니다.' });
  }
};

export const authByValidationTable: Middleware = async (req, res, next) => {
  const method: Method = req.method as Method;
  const originalUrl = req.originalUrl;
  const token = req.cookies.x_auth;
  const clubId: string = req.params.clubId
    ? req.params.clubId
    : req.body.clubId;
  if (!clubId) {
    res
      .status(500)
      .json({ status: 'fail', error: 'clubId를 params또는 body에 보내주세요' });
    return;
  }
  const validation: ValidationInterface | null = await Validation.findOne({
    clubId,
  });
  if (!validation) {
    res.status(401).json({
      status: 'fail',
      error: '해당 동아리는 인증 테이블을 가지고 있지 않습니다.',
    });
    return;
  } else {
    const validator: Role = await Validation.findValidator(
      validation,
      method,
      originalUrl
    );
    User.findByToken(token, (err, user) => {
      if (err) throw Error(err);
      req.body.authUser = user;
      if (process.env.SUPER_USERS?.includes(user ? user.userID : '')) {
        next();
        return;
      }
      User.findOne({ userID: user?.userID })
        .then((user) => {
          if (!user) {
            res
              .status(404)
              .json({ status: 'fail', error: '인증 정보가 없습니다.' });
          } else {
            const registeredClub: RegisteredClub | null =
              user.findByClubId(clubId);
            if (!registeredClub)
              return res.status(403).json({
                status: 'fail',
                error: '동아리에 가입되어있지 않습니다.',
              });
            else {
              req.body.registeredClubInfo = registeredClub;
              const result = Validation.validateUser(
                validator,
                registeredClub.role
              );
              if (result) next();
              else
                res.status(403).json({
                  status: 'fail',
                  error: `${validator}이상의 권한이 필요합니다.`,
                });
            }
          }
        })
        .catch((error) =>
          res.status(500).json({ status: 'fail', error: error.message })
        );
    });
  }
};

export const canUpdateUserCell: Middleware = async (req, res, next) => {
  const registeredClub: RegisteredClub = req.body.registeredClubInfo;
  const updatingRole: Role = req.body.updatingRole;
  const result = Validation.validateUser(updatingRole, registeredClub.role);
  const user: UserInterface = req.body.authUser;
  const userID: string = req.params.id;
  if (result) {
    if (user.userID === userID) {
      res.status(403).json({
        status: 'fail',
        error: '자신의 역할을 스스로 수정할 수 없습니다.',
      });
    } else {
      const user = await User.findOne({ userID });
      const changingUserInfo: RegisteredClub = user?.findByClubId(
        req.params.clubId
      ) as RegisteredClub;
      const result = Validation.validateUser(
        changingUserInfo.role,
        registeredClub.role
      );
      if (result && changingUserInfo.role !== registeredClub.role) {
        next();
      } else {
        res.status(403).json({
          status: 'fail',
          error: `귀하는 ${registeredClub.role}이므로 ${changingUserInfo.role}이상의 권한의 유저를 변경할 수 없습니다.`,
        });
      }
    }
  } else
    res.status(403).json({
      status: 'fail',
      error: `귀하는 ${registeredClub.role}이므로 ${updatingRole}이상의 권한을 부여할 수 없습니다.`,
    });
};

export const canDeregisterUser: Middleware = async (req, res, next) => {
  const userID = req.params.id;
  const clubId = req.params.clubId;
  const authUser = req.body.authUser;
  const user = await User.findOne({ userID });
  if (!user) {
    res
      .status(401)
      .json({ status: 'fail', error: '삭제할 유저가 존재하지 않습니다' });
    return;
  }
  const registeredClub: RegisteredClub | null = user.findByClubId(clubId);
  const myClub: RegisteredClub | null = authUser.findByClubId(clubId);
  if (!registeredClub || !myClub) {
    res.status(401).json({
      status: 'fail',
      error: '삭제 대상 또는 접속 유저가 해당 동아리에 속하지 않습니다.',
    });
    return;
  }
  const result = Validation.validateUser(registeredClub.role, myClub.role);
  if (!result || registeredClub.role === myClub.role) {
    res.status(403).json({
      status: 'fail',
      error: `귀하는 ${myClub.role}이므로 ${registeredClub.role}이상의 유저를 탈퇴시킬 권한이 없습니다.`,
    });
  } else {
    next();
  }
};

export const isOneSelf: Middleware = (req, res, next) => {
  const user: UserInterface = req.body.authUser;
  if (user.userID === req.params.id) {
    next();
  } else {
    res.status(401).json({
      status: 'fail',
      error:
        '동아리를 탈퇴하려는 인증 정보와 귀하의 인증 정보가 일치하지 않습니다.',
    });
  }
};
