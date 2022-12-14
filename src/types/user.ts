import { Role, Location, Column } from './common';
import { Types } from 'mongoose';

export interface RegisteredClub {
  clubId: string;
  clubName: string;
  role: Role;
  moreColumns: {
    column: Column;
    value: String;
  }[];
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RegisteredClubs = Map<string, RegisteredClub>;

export interface User {
  _id: Types.ObjectId;
  studentId: string;
  userID: string;
  password: string;
  location: Location;
  contact: string;
  registeredClubs: RegisteredClubs;
  name: string;
  major: string;
  token: string;
  tokenExp: number;
  createdAt: Date;
  updatedAt: Date;
}
