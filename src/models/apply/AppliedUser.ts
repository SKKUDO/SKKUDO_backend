import { Schema, model } from 'mongoose';
import { AppliedUser as AppliedUserInterface } from '../../types/apply';
import { columnSchema } from '../common/Column';
import { Applier } from './Applier';
import { Applier as ApplierInterface } from '../../types/apply';

const appliedUserSchema = new Schema<AppliedUserInterface>({
  clubId: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  clubName: {
    type: String,
    ref: 'Club',
    required: true,
  },
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  moreColumns: {
    type: [
      {
        column: columnSchema,
        value: String,
      },
    ],
  },
  documentAnswers: {
    type: [String],
  },
  documentScores: {
    type: [Number],
  },
  interviewScores: {
    type: [Number],
  },
  pass: {
    type: Boolean,
    defualt: false,
  },
  createdAt: Date,
  updatedAt: Date,
});

appliedUserSchema.pre('save', async function (next) {
  try {
    const { clubId } = this;
    const applier: ApplierInterface | null = await Applier.findOne({ clubId });
    if (!applier) {
      next(Error('지원한 유저에 상응하는 Applier가 없습니다.'));
      return;
    }
    let fail = false;
    let usingCol: string = '';
    applier.appliedUserColumns.forEach((column) => {
      let found = 0;
      this.moreColumns.forEach((col) => {
        if (col.column.key === column.key) {
          found = 1;
        }
      });
      if (!found) {
        fail = true;
        usingCol = column.key;
      }
    });
    if (fail) next(Error(`moreColumns: ${usingCol}에 상응하는 값이 없습니다.`));
    else next();
  } catch (error: any) {
    next(error);
  }
});

const AppliedUser = model<AppliedUserInterface>(
  'AppliedUser',
  appliedUserSchema
);

export { AppliedUser, appliedUserSchema };
