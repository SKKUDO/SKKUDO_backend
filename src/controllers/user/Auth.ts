import { User } from '../../models/user/User';
import { Controller } from '../../types/common';

export const login: Controller = async (req, res) => {
  User.findOne({ userID: req.body.userID }).then((user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: 'fail', error: '해당 아이디의 유저가 없습니다.' });
    else {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (String(isMatch) !== 'true')
          return res.status(403).json({
            status: 'fail',
            error: '비밀번호가 틀렸습니다.',
          });
        else {
          user.generateToken((err, user) => {
            if (err)
              return res
                .status(500)
                .json({ status: 'fail', error: err.message });
            if (user) {
              res
                .cookie('x_auth', user.token, {
                  maxAge: 60 * 60 * 60 * 24,
                })
                .status(200)
                .json({ status: 'success', data: user });
            }
          });
        }
      });
    }
  });
};

export const logout: Controller = (req, res) => {
  User.findOneAndUpdate(
    { userID: req.cookies.x_auth },
    { token: '' },
    (err: any) => {
      if (err)
        return res.status(500).json({ status: 'fail', error: err.message });
      return res
        .status(200)
        .cookie('x_auth', '', { maxAge: 0 })
        .json({ status: 'success', data: 'logged out' });
    }
  );
};

export const verify: Controller = (req, res) => {
  const authToken = req.body.authToken;
  const authUser = req.body.authUser;
  const data = { authToken, authUser };
  res.status(200).json({ status: 'success', data });
};
