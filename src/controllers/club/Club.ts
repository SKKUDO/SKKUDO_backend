import { Controller } from '../../types/common';
import { Club, clubSchema } from '../../models/club/Club';
import { Validation } from '../../models/validation/validation';
import { Column } from '../../types/common';
import { User } from '../../models/user/User';
import { RegisteredClub } from '../../types/user';
import { Types } from 'mongoose';
import fs from 'fs';

export const getAllClubs: Controller = async (req, res) => {
  try {
    const clubs = await Club.find({ accepted: true });
    res.status(200).json({ status: 'success', data: clubs });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getNotAcceptedClubs: Controller = async (req, res) => {
  try {
    const clubs = await Club.find({ accepted: false });
    res.status(200).json({ status: 'success', data: clubs });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneClub: Controller = async (req, res) => {
  try {
    const id: string = req.params.clubId;
    const club = await Club.findById(id);
    if (!club) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 동아리를 찾을 수 없습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createClub: Controller = async (req, res) => {
  try {
    const club = new Club(req.body);
    club.initializer = req.body.authUser.userID;
    club.accepted = false;
    const data = await club.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateClub: Controller = async (req, res) => {
  try {
    const id: string = req.params.clubId;
    //accept는 acceptClub으로만 할 수 있음
    if (req.body.accepted) {
      res.status(403).json({
        status: 'fail',
        error: '동아리 등록 허가는 별도의 라우터를 사용해야 합니다.',
      });
      return;
    }
    if (req.body.userColumns) {
      res.status(403).json({
        status: 'fail',
        error: '유저 컬럼은 별도의 라우터를 사용하여 수정하세요.',
      });
      return;
    }
    const nameChanging = req.body.name;
    const club = await Club.findOneAndUpdate({ _id: id }, req.body);
    if (!club) {
      res
        .status(404)
        .json({ status: 'fail', error: `${id}에 해당하는 동아리가 없습니다.` });
      return;
    }
    if (nameChanging) {
      const users = await User.find({ clubId: id });
      users.forEach((user) => user.updateClubName(id, req.body.name));
    }
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const acceptClub: Controller = async (req, res) => {
  try {
    const id: string = req.params.clubId;
    const club = await Club.findOne({ _id: id });
    //1. 동아리를 accept한다.
    if (!club) {
      res.status(404).json({ status: 'fail', error: 'Club not found' });
      return;
    }
    club.accepted = true;
    const initializer: string = club.initializer as string;
    const user = await User.findOne({ userID: initializer });
    //2. 설립자를 회장으로 등록한다.
    if (!user) {
      res.status(404).json({
        status: 'fail',
        error:
          '동아리의 설립자가 없습니다. DB에 corruption이 있을 수 있습니다.',
      });
      return;
    }
    const newRegisteredClub: RegisteredClub = {
      clubId: id,
      role: '회장',
      clubName: club.name,
      moreColumns: [],
      image: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    user.registeredClubs.set(id, newRegisteredClub);
    //해당 동아리의 ValidationTable을 만든다.
    const validation = new Validation();
    validation.clubId = new Types.ObjectId(req.params.clubId);
    await validation.save();
    await user.save();
    await club.save();
    res.status(200).json({ status: 'success', data: club });
  } catch (error) {
    res.status(500).json({ status: 'fail', error: error });
  }
};

export const deleteClub: Controller = async (req, res) => {
  try {
    const id: string = req.params.clubId;
    const club = await Club.findByIdAndDelete(id);
    if (!club) {
      res
        .status(404)
        .json({ status: 'fail', error: `${id}에 해당하는 동아리가 없습니다.` });
      return;
    }
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
  //모든 클럽과 관련한 모델들 지우기
};

export const addClubUserColumn: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const newColumn: Column = req.body.userColumn;
    const club: any = await Club.findOne({ _id: clubId });
    if (!club) {
      res.status(404).json({ status: 'fail', error: 'club not found' });
      return;
    }
    let found = 0;
    club.userColumns.forEach((item: Column) => {
      if (item.key == newColumn.key) found++;
    });
    if (found !== 0) {
      res.status(403).json({
        status: 'fail',
        error: '이미 존재하는 컬럼을 추가하려고 합니다.',
      });
      return;
    }
    club.userColumns = [...club.userColumns, newColumn];
    req.body.refinedUsers.forEach((user: any) => {
      user.addColumn(clubId, newColumn, '');
    });
    await club.save();
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateClubUserColumn: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const key: string = req.body.key;
    const newColumn: Column = req.body.newColumn;
    const club = await Club.findOne({ _id: clubId });
    if (!club) {
      res.status(404).json({
        status: 'fail',
        error: `${clubId}에 해당하는 동아리가 없습니다.`,
      });
      return;
    }
    let found = 0;
    let using = 0;
    club.userColumns.forEach((column: Column) => {
      if (column.key === newColumn.key) using++;
    });
    club.userColumns = club.userColumns.map((column) => {
      if (column.key === key) {
        found++;
        return newColumn;
      } else return column;
    });
    if (found === 0) {
      res
        .status(404)
        .json({ status: 'fail', error: `key(${key})가 없습니다.` });
      return;
    }
    if (using) {
      res.status(403).json({
        status: 'fail',
        error: `바꾸려는 Column의 key(${newColumn.key})는 이미 사용중입니다.`,
      });
      return;
    }
    req.body.refinedUsers.forEach((user: any) => {
      user.updateColumn(clubId, key, newColumn);
    });
    await club.save();
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteClubUserColumn: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const key: string = req.body.key;
    const club = await Club.findOne({ _id: clubId });
    if (!club) {
      res.status(404).json({ status: 'fail', error: 'club not found' });
      return;
    }
    club.userColumns = club.userColumns.filter(
      (userColumn) => userColumn.key !== key
    );
    req.body.refinedUsers.forEach((user: any) => {
      user.deleteColumn(clubId, key);
    });
    await club.save();
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const uploadImage: Controller = async (req, res) => {
  try {
    const id: string = req.params.clubId;
    const club = await Club.findById(id);
    if (!club) {
      res
        .status(404)
        .json({ status: 'fail', error: `${id}에 해당하는 동아리가 없습니다.` });
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ status: 'fail', error: '업로드할 이미지를 찾지 못했습니다.' });
      return;
    }
    if (club.image) {
      fs.unlinkSync(club.image);
    }
    club.image = req.file.path;
    const users = await User.find({ clubId: id });
    users.forEach((user) => user.updateImage(id, club.image));
    club.save();
    res.status(200).json({ status: 'success', data: club });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
