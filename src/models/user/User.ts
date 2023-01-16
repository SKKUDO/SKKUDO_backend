import { Schema, model, Model, Types } from 'mongoose';
import { User, User as UserInterface, RegisteredClub } from '../../types/user';
import { Location, Column } from '../../types/common';
import { registeredClubSchema } from './RegisteredClub';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const locations: Location[] = ['인사캠', '자과캠'];

const userSchema = new Schema<UserInterface>({
  studentId: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
    message: '10자리의 학번을 정확하게 입력하세요.',
  },
  userID: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    message: '아이디는 필수 사항이며 5자리 이상, 중복되어서는 안됩니다.',
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    message: '비밀번호는 5자리 이상이어야 합니다.',
  },
  location: {
    type: String,
    required: true,
    enum: {
      values: locations,
      message: '인사캠 또는 자과캠이어야 합니다.',
    },
  },
  contact: {
    type: String,
  },
  registeredClubs: {
    type: Map,
    of: registeredClubSchema,
    default: {},
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  createdAt: Date,
  updatedAt: Date,
});

//유저 모델 저장 전 시행되는 미들웨어; 비밀번호를 암호화함;
userSchema.pre('save', async function (next) {
  try {
    const user = this;
    if (!user.isModified('password')) return next();
    const salt: string = await bcrypt.genSalt(
      parseInt(process.env.SALT_ROUNDS as string)
    );
    const hashedPW: string = await bcrypt.hash(user.password, salt);
    user.password = hashedPW;
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (plainPassword: string) {
  try {
    const isMatch: boolean = await bcrypt.compare(plainPassword, this.password);
    return isMatch;
  } catch (error: any) {
    return error;
  }
};

userSchema.methods.generateToken = async function () {
  try {
    const user = this;
    const token = jwt.sign(
      {
        data: user._id.toHexString(),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, //24시간 후 토큰 만료됨
      },
      process.env.SECRET_TOKEN as string
    );
    user.token = token;
    const data: UserInterface = await user.save();
    return data;
  } catch (error: any) {
    return error;
  }
};

userSchema.methods.findByClubId = function (
  clubId: string
): RegisteredClub | null {
  const user = this;
  return user.registeredClubs.get(clubId);
};

userSchema.methods.updateClubName = function (clubId: string, name: string) {
  const user = this;
  const registeredClub: RegisteredClub = user.registeredClubs.get(clubId);
  if (registeredClub) {
    registeredClub.clubName = name;
    user.registeredClubs.set(clubId, registeredClub);
    user.save();
  }
};

userSchema.methods.updateImage = function (clubId: string, image: string) {
  const user = this;
  const registeredClub: RegisteredClub = user.registeredClubs.get(clubId);
  if (registeredClub) {
    registeredClub.image = image;
    user.registeredClubs.set(clubId, registeredClub);
    user.save();
  }
};

userSchema.methods.addColumn = function (
  clubId: string,
  column: Column,
  value: string
) {
  const user = this;
  const registeredClub: RegisteredClub = user.registeredClubs.get(clubId);
  if (registeredClub) {
    const obj = { column, value };
    registeredClub.moreColumns.push(obj);
    user.registeredClubs.set(clubId, registeredClub);
    user.save();
  }
};

userSchema.methods.updateValue = function (
  clubId: string,
  key: string,
  value: string
) {
  const user = this;
  const registeredClub: RegisteredClub = user.registeredClubs.get(clubId);
  if (registeredClub) {
    registeredClub.moreColumns.forEach((column) => {
      if (column.column.key === key) column.value = value;
    });
    user.registeredClubs.set(clubId, registeredClub);
    user.save();
  }
};

userSchema.methods.updateColumn = function (
  clubId: string,
  key: string,
  newColumn: Column
) {
  const user = this;
  const registeredClub: RegisteredClub = user.registeredClubs.get(clubId);
  if (registeredClub) {
    registeredClub.moreColumns.forEach((column) => {
      if (column.column.key === key) column.column = newColumn;
    });
    user.save();
  }
};

interface moreColumn {
  column: Column;
  value: string;
}

userSchema.methods.deleteColumn = function (clubId: string, key: string) {
  const user = this;
  console.log(user.registeredClubs.get(clubId));
  const registeredClub = user.registeredClubs.get(clubId);
  registeredClub.moreColumns = registeredClub.moreColumns.filter(
    (column: moreColumn) => column.column.key !== key
  );
  user.save();
};

userSchema.statics.findByToken = async function (token: any) {
  try {
    const user = this;
    const decoded: any = jwt.verify(
      String(token),
      String(process.env.SECRET_TOKEN)
    );
    const result: UserInterface | null = user.findOne({
      _id: decoded ? decoded.data : undefined,
      token: token,
    });
    return result;
  } catch (error) {
    return error;
  }
};

interface UserMethods {
  comparePassword(plainPassword: string): Promise<boolean>;
  generateToken(): Promise<UserInterface>;
  updateClubName(clubId: string, name: string): void;
  updateImage(clubId: string, image: string): void;
  addColumn(clubId: string, column: Column, value: string): void;
  updateValue(clubId: string, key: string, value: string): void;
  updateColumn(clubId: string, key: string, newColumn: Column): void;
  deleteColumn(clubId: string, key: string): void;
  findByClubId(clubId: string): RegisteredClub | null;
}

interface UserModel extends Model<UserInterface, {}, UserMethods> {
  findByToken(token: string): Promise<any>;
}

const User = model<UserInterface, UserModel>('User', userSchema);

export { User, userSchema };
