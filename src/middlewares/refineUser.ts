import { User } from '../models/user/User';
import { User as UserInterface } from '../types/user';
import { Middleware } from '../types/common';

export const refineUsers: Middleware = async (req, res, next) => {
  try {
    let users: UserInterface[] = await User.find();
    users = users.filter((user) => user.registeredClubs.get(req.params.clubId));
    if (users.length == 0)
      return res.status(404).json({
        status: 'fail',
        error: '해당 동아리에 존재하는 유저가 없습니다.',
      });
    req.body.refinedUsers = users;
    next();
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
