import { User } from '../../models/user/User';
import { Controller } from '../../types/common';

export const login: Controller = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.body.userID });
    if (!user)
      return res
        .status(401)
        .json({ status: 'fail', error: '해당 아이디의 유저가 없습니다.' });
    const isMatch: boolean = await user.comparePassword(req.body.password);
    if (String(isMatch) !== 'true')
      return res
        .status(403)
        .json({ status: 'fail', error: '비밀번호가 틀렸습니다.' });
    const data = await user.generateToken();
    if (!data) throw Error('유저의 토큰을 발급하지 못했습니다.');
    res
      .cookie('x_auth', user.token, {
        maxAge: 60 * 60 * 60 * 24,
      })
      .status(200)
      .json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const logout: Controller = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userID: req.cookies.x_auth },
      { token: '' }
    );
    return res
      .status(200)
      .cookie('x_auth', '', { maxAge: 0 })
      .json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const verify: Controller = (req, res) => {
  const authToken = req.body.authToken;
  const authUser = req.body.authUser;
  const data = { authToken, authUser };
  res.status(200).json({ status: 'success', data });
};
