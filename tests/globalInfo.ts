export const usingClubId: string = '6381914745ab0d6e50600905';

export type LoginInfoType = {
  userID: string;
  password: string;
};

export const testClubLoginInfo: LoginInfoType = {
  userID: process.env.TEST_CLUB_ID as string,
  password: process.env.TEST_CLUB_PW as string,
};

export const testAdminLoginInfo: LoginInfoType = {
  userID: process.env.TEST_ADMIN_ID as string,
  password: process.env.TEST_ADMIN_PW as string,
};

import app from '../src/index';
import request from 'supertest';

export const agent = request.agent(app); //agent를 이용하면 요청을 지속시킬 수 있다.(쿠키 값 유지 가능) !!!
