import { Controller } from '../../types/common';
import { Budget } from '../../models/budget/Budget';

export const getAllBudgets: Controller = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.status(200).json({ status: 'success', data: budgets });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getBudgetByClubId: Controller = async (req, res) => {
  try {
    const budget = await Budget.findOne({ clubId: req.params.clubId });
    if (!budget) {
      res.status(404).json({
        status: 'fail',
        error: '해당 동아리는 가계부를 가지고 있지 않습니다.',
      });
      return;
    }
    res.status(200).json({ status: 'success', data: budget });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getOneBudget: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const budget = await Budget.findById(id);
    if (!budget) {
      res.status(404).json({ status: 'fail', error: 'budget not found' });
    } else {
      res.status(200).json({ status: 'success', data: budget });
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'fail',
      error: error.message,
    });
  }
};

export const createBudget: Controller = async (req, res) => {
  try {
    const budget = new Budget(req.body);
    const isOccupied = await Budget.findOne({ clubId: req.body.clubId });
    if (isOccupied) {
      res.status(403).json({
        status: 'fail',
        error: `${req.body.clubId} 동아리에 이미 가계부가 있습니다.`,
      });
      return;
    }
    const data = await budget.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateBudget: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const budget = await Budget.findOneAndUpdate({ _id: id }, req.body);
    if (!budget) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 상응하는 가계부가 존재하지 않습니다.`,
      });
      return;
    }
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateBudgetRow: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const budget = await Budget.findById(id);
    if (!budget) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 상응하는 가계부가 존재하지 않습니다.`,
      });
      return;
    }
    budget.rows[Number(req.params.line)] = req.body;
    const data = await budget.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteBudget: Controller = async (req, res) => {
  try {
    const data = await Budget.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const deleteBudgetRow: Controller = async (req, res) => {
  try {
    const id: string = req.params.id;
    const budget = await Budget.findById(id);
    if (!budget) {
      res.status(404).json({
        status: 'fail',
        error: `${id}에 상응하는 가계부가 존재하지 않습니다.`,
      });
      return;
    }
    budget.rows.splice(Number(req.params.line), 1);
    const data = await budget.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};
