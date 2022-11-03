import { Types } from 'mongoose';

export interface NoticeTag {
  _id: Types.ObjectId;
  clubId: String;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notice {
  _id: Types.ObjectId;
  writer: string;
  clubId: String; //동아리 ID
  title: string; //제목
  content: string; //내용
  noticeTags: NoticeTag[]; //태그
  createdAt: Date;
  updatedAt: Date;
}
