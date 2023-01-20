import { Controller } from '../../types/common';
import { AppliedUser } from '../../models/apply/AppliedUser';
import { Club } from '../../models/club/Club';
import { User as UserInterface } from '../../types/user';

export const getAllAppliedUsers: Controller = async (req, res) => {
  try {
    const users = await AppliedUser.find();
    res.status(200).json({ status: 'success', data: users });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getAppliedUsersByClubId: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const club = await Club.findById(clubId);
    if (!club) {
      res.status(404).json({
        status: 'fail',
        error: `${clubId}에 해당하는 동아리가 존재하지 않습니다.`,
      });
      return;
    }
    let appliedUsers = await AppliedUser.find();
    appliedUsers = appliedUsers.filter(
      (user) => user.clubId.toString() === clubId
    );
    res.status(200).json({ status: 'success', data: appliedUsers });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getAppliedUsersByUserId: Controller = async (req, res) => {
  try {
    const authUser: UserInterface = req.body.authUser;
    const appliedUsers = await AppliedUser.find({ userID: authUser.userID });
    res.status(200).json({ status: 'success', data: appliedUsers });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createAppliedUser: Controller = async (req, res) => {
  try {
    const authUser = req.body.authUser;
    const clubId = req.body.clubId;
    const using = authUser.findByClubId(clubId);
    if (using) {
      res
        .status(403)
        .json({ status: 'fail', error: '동아리에 이미 가입되어있습니다.' });
      return;
    }
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    const appliedUser = new AppliedUser(req.body);
    await appliedUser.save();
    res.status(200).json({ status: 'success', data: appliedUser });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateAppliedUser: Controller = async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const id: string = req.params.id;
    const updatedAppliedUser = await AppliedUser.findOneAndUpdate(
      { _id: id },
      req.body
    );
    if (!updatedAppliedUser) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 유저가 존재하지 않습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: updatedAppliedUser });
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
};

export const deleteAppliedUser: Controller = async (req, res) => {
  try {
    const appliedUser = await AppliedUser.findByIdAndDelete(req.params.id);
    if (!appliedUser) {
      res.status(404).json({
        status: 'fail',
        error: `${req.params.id}에 해당하는 유저가 없습니다.`,
      });
    }
    res.status(200).json({ status: 'success', data: appliedUser });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const deleteAppliedUsersByClubId: Controller = async (req, res) => {
  try {
    const data = await AppliedUser.deleteMany({ clubId: req.params.clubId });
    res.status(200).json({
      status: 'success',
      data,
      message:
        '만약 지워지지 않은 경우 애초에 지원자가 없거나 clubId가 잘못되었을 수 있습니다.',
    });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
