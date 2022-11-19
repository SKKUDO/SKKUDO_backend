import express from 'express';
import {
  getAllUsers,
  getUsersByClubId,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
  registerClub,
  registerPassedUsers,
  deregisterClub,
  updateRole,
  updateUsercolumn,
} from '../../controllers/user/User';
import {
  auth,
  authBySuperUser,
  authByValidationTable,
  canUpdateUserCell,
} from '../../middlewares/auth';
import { isApplierExist } from '../../middlewares/club';

const UserRouter = express.Router();

UserRouter.get('/', auth, authBySuperUser, getAllUsers);

UserRouter.get('/byClub/:clubId', authByValidationTable, getUsersByClubId);

UserRouter.get('/:id', getOneUser);

UserRouter.post('/', createUser);

UserRouter.patch('/:id', auth, updateUser);

UserRouter.delete('/:id', auth, deleteUser);

UserRouter.patch(
  '/club/register/many/:clubId',
  authByValidationTable,
  registerPassedUsers
);

UserRouter.patch('/club/register/:id/:clubId', registerClub);

UserRouter.patch(
  '/club/deregister/:id/:clubId',
  authByValidationTable,
  deregisterClub
);

UserRouter.patch('/club/moreColumn/:clubId', auth, updateUsercolumn);

UserRouter.patch(
  '/club/role/:id/:clubId',
  authByValidationTable,
  canUpdateUserCell,
  updateRole
);

export default UserRouter;
