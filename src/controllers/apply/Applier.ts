import { Controller } from '../../types/common';
import { Applier } from '../../models/apply/Applier';
import { Club } from '../../models/club/Club';
import { Column } from '../../types/common';

export const getAllAppliers: Controller = async (req, res) => {
  try {
    const appliers = await Applier.find();
    res.status(200).json({ status: 'success', data: appliers });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const getApplierByClubId: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    const applier = await Applier.find({ clubId });
    if (!applier) {
      res.status(404).json({
        status: 'fail',
        error: `clubId가 ${clubId}인 Applier가 존재하지 않습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data: applier });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const createApplier: Controller = async (req, res) => {
  try {
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    const applier = new Applier(req.body);
    const club = await Club.findById(applier.clubId.toString());
    if (!club) {
      res.status(400).json({
        status: 'fail',
        error: `${applier.clubId}에 해당하는 동아리가 존재하지 않습니다.`,
      });
      return;
    }
    const isOccupied = await Applier.find({ clubId: applier.clubId });
    if (isOccupied) {
      res.status(400).json({
        status: 'fail',
        error: `${applier.clubId} 동아리에 이미 Applier가 있습니다.`,
      });
      return;
    }
    const data = await applier.save();
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};

export const updateApplier: Controller = async (req, res) => {
  try {
    const clubId: string = req.params.clubId;
    req.body.updatedAt = new Date();
    const data = await Applier.findOneAndUpdate({ clubId }, req.body);
    if (!data) {
      res.status(404).json({
        status: 'fail',
        error: `${req.params.clubId} 동아리에 속하는 Applier가 없습니다.`,
      });
      return;
    }
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

export const deleteApplier: Controller = async (req, res) => {
  try {
    const data = await Applier.findOneAndDelete({ clubId: req.params.clubId });
    if (!data) {
      res
        .status(404)
        .json({
          status: 'fail',
          error: `${req.params.clubId} 동아리에 속하는 Applier가 없습니다.`,
        });
      return;
    }
    res.status(200).json({ status: 'success', data });
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
