import { Middleware } from '../types/common';
import { User as UserInterface, RegisteredClub } from '../types/user';
import { Validation as ValidationInterface } from '../types/validation';
import { Validation } from '../models/validation/validation';

export const canRetrievePrivateToDos: Middleware = async (req, res, next) => {
  const user: any = req.body.authUser;
  if (!user)
    return res
      .status(401)
      .json({ status: 'fail', error: '인증 정보가 없습니다.' });
  const club: RegisteredClub = user.findByClubId(req.params.clubId);
  const validation: ValidationInterface = (await Validation.findOne({
    clubId: req.params.clubId,
  })) as ValidationInterface;
  const result: boolean = Validation.validateUser(
    validation.todoWrite,
    club.role
  );
  req.body.private = result ? process.env.PRIVATE_CODE : '';
  next();
};

export const canRetrievePrivateNotices: Middleware = async (req, res, next) => {
  const user: any = req.body.authUser;
  if (!user)
    return res
      .status(401)
      .json({ status: 'fail', error: '인증 정보가 없습니다.' });
  const club: RegisteredClub = user.findByClubId(req.params.clubId);
  const validation: ValidationInterface = (await Validation.findOne({
    clubId: req.params.clubId,
  })) as ValidationInterface;
  const result: boolean = Validation.validateUser(
    validation.noticeWrite,
    club.role
  );
  req.body.private = result ? process.env.PRIVATE_CODE : '';
  next();
};
