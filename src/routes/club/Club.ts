import express from 'express';
import {
  getAllClubs,
  getOneClub,
  createClub,
  updateClub,
  acceptClub,
  deleteClub,
} from '../../controllers/club/Club';
import { authByValidationTable } from '../../middlewares/auth';

const ClubRouter = express.Router();

ClubRouter.get('/', getAllClubs);

ClubRouter.get('/:clubId', getOneClub);

ClubRouter.post('/', createClub);

ClubRouter.patch('/:clubId', authByValidationTable, updateClub);

ClubRouter.patch('/accept/:clubId', acceptClub);

ClubRouter.delete('/:clubId', authByValidationTable, deleteClub);

export default ClubRouter;
