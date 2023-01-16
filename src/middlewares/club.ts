import { Middleware } from '../types/common';
import { Applier } from '../models/apply/Applier';

export const isApplierExist: Middleware = async (req, res, next) => {
  try {
    const clubId = req.params.clubId;
    const applier = await Applier.find({ clubId });
    if (applier.length > 0)
      res
        .status(403)
        .json({
          status: 'fail',
          error: '모집공고가 있는 상태에서 club의 정보를 변경할 수 없습니다.',
        });
    else next();
  } catch (error: any) {
    res.status(500).json({ status: 'fail', error: error.message });
  }
};
