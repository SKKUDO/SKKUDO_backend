import { Controller } from '../../types/common';
import { ToDo } from '../../models/todo/ToDo';
import { ToDoTag } from '../../models/todo/ToDoTag';

export const getAllToDos: Controller = async (req, res) => {
  try {
    const toDos = await ToDo.find();
    res.status(200).json({ status: 'success', data: toDos });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getToDosByClubId: Controller = async (req, res) => {
  try {
    const toDos = await ToDo.find({ clubId: req.params.clubId });
    if (req.body.private === process.env.PRIVATE_CODE) {
      res.status(200).json({ status: 'success', data: toDos });
      return;
    }
    const elems = toDos.filter((todo) => todo.private === false);
    res.status(200).json({ status: 'success', data: elems });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneToDo: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const todo = await ToDo.findById(id);
    if (!todo) {
      res
        .status(404)
        .json({ status: 'fail', error: `${id}에 해당하는 일정이 없습니다.` });
      return;
    }
    res.status(200).json({ status: 'success', data: todo });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createToDo: Controller = async (req, res) => {
  try {
    req.body.writer = req.body.authUser.name;
    const toDo = new ToDo(req.body);
    if (new Date(req.body.startTime) >= new Date(req.body.endTime)) {
      res.status(400).json({
        status: 'fail',
        error: '일정의 끝나는 시간이 시작 시간보다 앞설 수 없습니다.',
      });
      return;
    }
    await toDo.save();
    res.status(200).json({ status: 'success', data: toDo });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateToDo: Controller = async (req, res) => {
  try {
    req.body.writer = req.body.authUser.name;
    const id: string = req.params.id;
    const todo = await ToDo.findOneAndUpdate({ _id: id }, req.body);
    if (!todo) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 해당하는 일정을 찾을 수 없습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: todo });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const deleteToDo: Controller = async (req, res) => {
  try {
    const todo = await ToDo.findByIdAndDelete(req.params.id);
    if (!todo) {
      res.status(404).json({
        status: 'fail',
        error: `${req.params.id}에 해당하는 일정이 없습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: todo });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
