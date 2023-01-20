import { Validation } from '../models/validation/validation';
import { Controller } from '../types/common';
import { Types } from 'mongoose';

export const getAllValidations: Controller = async (req, res) => {
  try {
    const data = await Validation.find();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getValidationByClubId: Controller = async (req, res) => {
  try {
    const data = await Validation.findOne({ clubId: req.params.clubId });
    if (!data)
      return res.status(404).json({
        status: 'fail',
        error: '해당 동아리의 인증 테이블을 찾을 수 없습니다.',
      });
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createValidation: Controller = async (req, res) => {
  try {
    const isExist = await Validation.findOne({ clubId: req.params.clubId });
    if (isExist)
      return res.status(403).json({
        status: 'fail',
        error: '해당 동아리의 인증 테이블이 이미 존재합니다.',
      });
    const validation = new Validation(req.body);
    validation.clubId = new Types.ObjectId(req.params.clubId);
    const data = await validation.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const updateValidation: Controller = async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const data = await Validation.findOneAndUpdate(
      { clubId: clubId },
      req.body
    );
    if (!data)
      return res.status(404).json({
        status: 'fail',
        error: `동아리 ${clubId}에 해당하는 인증테이블이 존재하지 않습니다.`,
      });
    return res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'success', error: error.message });
  }
};

export const deleteValidation: Controller = async (req, res) => {
  try {
    const validation = await Validation.findOneAndDelete({
      clubId: req.params.clubId,
    });
    if (!validation)
      return res.status(404).json({
        status: 'fail',
        error: `동아리 ${req.params.clubId}에 해당하는 인증 테이블이 존재하지 않습니다.`,
      });
    res.status(200).json({ status: 'success', data: validation });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
