import { Controller } from '../../types/common';
import { ClubType, clubTypeSchema } from '../../models/club/ClubType';
import { ClubType as ClubTypeInterface } from '../../types/club';
import { Club } from '../../models/club/Club';
import { Club as ClubInterface } from '../../types/club';

export const getAllClubTypes: Controller = async (req, res) => {
  try {
    const clubTypes = await ClubType.find();
    res.status(200).json({ status: 'success', data: clubTypes });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneClubType: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const clubType = await ClubType.findById(id);
    if (!clubType) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 상응하는 동아리 유형이 존재하지 않습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: clubType });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createClubType: Controller = async (req, res) => {
  try {
    const clubType = new ClubType(req.body);
    const data = await clubType.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteClubType: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const clubType = await ClubType.findById(id);
    if (!clubType) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 상응하는 동아리 유형이 없습니다.`,
      });
      return;
    }
    const usingType: string = clubType.name;
    const clubs: ClubInterface[] = await Club.find();
    clubs.forEach((club) => {
      if (club.type.name === usingType) {
        throw Error(`해당 유형을 사용하고 있는 동아리가 존재합니다.`);
      }
    });
    clubType.remove();
    res.status(200).json({ status: 'success', data: 'data deleted' });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
