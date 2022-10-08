import { Role, Location, Column } from './common';
import { Types } from 'mongoose';

export interface RegisteredClub {
  _id: Types.ObjectId;
  clubId: Types.ObjectId;
  role: Role;
  moreColumns: {
    column: Column;
    value: String;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: Types.ObjectId;
  studentId: string;
  userID: string;
  password: string;
  location: Location;
  registeredClubs: RegisteredClub[];
  name: string;
  major: string;
  createdAt: Date;
  updatedAt: Date;
}