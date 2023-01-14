import { Club as ClubInterface, RecruitType } from '../../types/club';
import { Applier } from './../apply/Applier';
import { clubTypeSchema } from './ClubType';
import { Location } from '../../types/common';
import { Schema, model } from 'mongoose';
import { columnSchema } from '../common/Column';

const location: Location[] = ['인사캠', '자과캠'];
const recruitType: RecruitType[] = ['상시모집', '정규모집'];

const clubSchema = new Schema<ClubInterface>({
  name: {
    type: String,
    required: true,
    message: 'name is string and required',
  },
  location: {
    type: String,
    required: true,
    enum: {
      values: location,
      message: 'location은 인사캠 또는 자과캠만 올 수 있습니다.',
    },
  },
  initializer: {
    type: String,
    required: true,
    ref: 'User',
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  type: {
    type: clubTypeSchema,
    required: true,
    ref: 'ClubType',
  },
  userColumns: {
    type: [columnSchema],
  },
  image: {
    type: String,
  },
  recruitType: {
    type: String,
    required: true,
    enum: {
      values: recruitType,
      message: '모집유형은 정규모집 또는 상시모집입니다.',
    },
  },
  recruitStart: {
    type: Date,
  },
  recruitEnd: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

const Club = model<ClubInterface>('Club', clubSchema);

clubSchema.pre('save', async function (next) {
  try {
    if (this.isModified('userColumn')) {
      const appliers = await Applier.find({ clubId: this._id });
      if (appliers.length > 0)
        next(
          Error(
            'Applier가 있는 상태에서 클럽의 userColumns를 변경할 수 없습니다.'
          )
        );
      else next();
    }
  } catch (error: any) {
    next(Error(error.message));
  }
});

clubSchema.pre(/^find/, function (next) {
  const copied: any = this;
  copied.find({ accepted: true });
  next();
});

export { Club, clubSchema };
