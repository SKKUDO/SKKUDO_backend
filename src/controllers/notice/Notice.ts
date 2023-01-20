import { Controller } from '../../types/common';
import { Notice } from '../../models/notice/Notice';
import { Notice as NoticeInterface } from '../../types/notice';

export const getAllNotices: Controller = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.status(200).json({ status: 'success', data: notices });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getNoticesByClubId: Controller = async (req, res) => {
  try {
    const notices = await Notice.find({ clubId: req.params.clubId });
    if (req.body.private === process.env.PRIVATE_CODE) {
      res.status(200).json({ status: 'success', data: notices });
      return;
    }
    const filtered = notices.filter(
      (item: NoticeInterface) => item.private !== true
    );
    res.status(200).json({ status: 'success', data: filtered });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneNotice: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const notice = await Notice.findById(id);
    if (!notice) {
      res.status(404).json({ status: 'fail', error: 'notice not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: notice });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createNotice: Controller = async (req, res) => {
  try {
    const notice = new Notice(req.body);
    const data = await notice.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateNotice: Controller = async (req, res) => {
  try {
    req.body.writer = req.body.authUser.name;
    const id: string = req.params.id;
    const data = await Notice.findOneAndUpdate({ _id: id }, req.body);
    if (!data) {
      res
        .status(404)
        .json({ status: 'fail', error: `${id}에 해당하는 공지가 없습니다.` });
      return;
    }
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      error: error.message,
    });
  }
};

export const deleteNotice: Controller = async (req, res) => {
  try {
    const data = await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
