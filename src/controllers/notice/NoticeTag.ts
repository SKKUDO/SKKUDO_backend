import { Controller } from '../../types/common';
import { NoticeTag } from '../../models/notice/NoticeTag';
import { Notice } from '../../models/notice/Notice';

export const getAllNoticeTags: Controller = async (req, res) => {
  try {
    const noticeTags = await NoticeTag.find();
    res.status(200).json({ status: 'success', data: noticeTags });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      error: error.message,
    });
  }
};

export const getNoticeTagsByClubId: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const data = await NoticeTag.find({ clubId });
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneNoticeTag: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const noticeTag = await NoticeTag.findById(id);
    if (!noticeTag) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 공지 태그가 없습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: noticeTag });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      error: error.message,
    });
  }
};

export const createNoticeTag: Controller = async (req, res) => {
  try {
    const noticeTag = new NoticeTag(req.body);
    const data = await noticeTag.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteNoticeTag: Controller = async (req, res) => {
  try {
    const id = req.params.id;
    const noticeTag = await NoticeTag.findOne({ _id: id });
    if (!noticeTag) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 공지 태그가 없습니다.`,
      });
      return;
    }
    const result = await noticeTag.remove();
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
