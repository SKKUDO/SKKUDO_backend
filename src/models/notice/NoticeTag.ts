import { Schema, model, Types } from 'mongoose';
import { NoticeTag as NoticeTagInterface } from '../../types/notice';
import { NoticeTag } from '../../types/notice';
import { Notice as NoticeInterface } from '../../types/notice';
import { Notice } from './Notice';

const noticeTagSchema = new Schema<NoticeTagInterface>({
  clubId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

noticeTagSchema.pre('remove', async function (next) {
  try {
    const noticeTag = this;
    const notices = await Notice.find({ clubId: noticeTag.clubId });
    let usingTag: boolean = false;
    notices.forEach((notice) => {
      if (notice.noticeTags.indexOf(noticeTag.name) >= 0) {
        usingTag = true;
      }
    });
    if (usingTag) next(Error('해당 태그를 사용하는 공지가 있습니다.'));
    else next();
  } catch (error: any) {
    next(Error(error));
  }
});

const NoticeTag = model<NoticeTagInterface>('NoticeTag', noticeTagSchema);

export { NoticeTag, noticeTagSchema };
