import { Controller } from '../../types/common';
import { ToDoTag } from '../../models/todo/ToDoTag';

export const getAllToDoTags: Controller = async (req, res) => {
  try {
    const tags = await ToDoTag.find();
    res.status(200).json({ status: 'success', data: tags });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getToDoTagsByClubId: Controller = async (req, res) => {
  try {
    const tags = await ToDoTag.find({ clubId: req.params.clubId });
    res.status(200).json({ status: 'success', data: tags });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneToDoTag: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const tag = await ToDoTag.findById(id);
    if (!tag) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 일정 태그가 존재하지 않습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: tag });
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      error: error.message,
    });
  }
};

export const createToDoTag: Controller = async (req, res) => {
  try {
    const tag = new ToDoTag(req.body);
    const result = await tag.save();
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteToDoTag: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const tag = await ToDoTag.findById(id);
    if (!tag) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 일정 태그가 없습니다.`,
      });
      return;
    }
    const result = await tag.remove();
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
