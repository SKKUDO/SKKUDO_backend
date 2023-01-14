import app from '../src/index';
import request from 'supertest';

type LoginInfoType = {
  userID: string;
  password: string;
};

const usingClubId: string = '6381914745ab0d6e50600905';

const testClubLoginInfo: LoginInfoType = {
  userID: process.env.TEST_CLUB_ID as string,
  password: process.env.TEST_CLUB_PW as string,
};

const testAdminLoginInfo: LoginInfoType = {
  userID: process.env.TEST_ADMIN_ID as string,
  password: process.env.TEST_ADMIN_PW as string,
};

const createApplierBody = {
  clubId: usingClubId,
  documentQuestions: [],
  interviewQuestions: ['면접질문1', '면접질문2'],
  appliedUserColumns: [
    { key: '트랙', valueType: 'string' },
    { key: '학년', valueType: 'number' },
  ],
};

export const agent = request.agent(app); //agent를 이용하면 요청을 지속시킬 수 있다.(쿠키 값 유지 가능) !!!

describe('POST /auth/login', () => {
  test('login', (done) => {
    agent.post('/auth/login').send(testAdminLoginInfo).expect(200, done);
  });
});

describe('GET /appliers', () => {
  test('getAllAppliers', (done) => {
    agent.get('/applies/appliers').set('x_auth', '').expect(200, done);
  });
});

describe('GET /applies/appliers/byClub/:clubId', () => {
  test('getApplierByClubId', (done) => {
    agent.get(`/applies/appliers/byClub/${usingClubId}`).expect(404, done);
  });
});

describe('POST /applies/appliers', () => {
  test('createApplier', (done) => {
    agent.post('/applies/appliers').send(createApplierBody).expect(200, done);
  });
});

describe('PATCH /applies/appliers', () => {
  test('updateApplier', (done) => {
    agent
      .patch(`/applies/appliers`)
      .send({ documentQuestions: ['a'] })
      .expect(200, done);
  });
});

describe('DELETE /applies/appliers', () => {
  test('deleteApplier', (done) => {
    agent.delete(`/applier/applies/${usingClubId}`).expect(200, done);
  });
});
