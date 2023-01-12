import app from '../src/index';
import request from 'supertest';

type LoginInfoType = {
  userID: string;
  password: string;
};

const testClubLoginInfo: LoginInfoType = {
  userID: process.env.TEST_CLUB_ID as string,
  password: process.env.TEST_CLUB_PW as string,
};

const testAdminLoginInfo: LoginInfoType = {
  userID: process.env.TEST_ADMIN_ID as string,
  password: process.env.TEST_ADMIN_PW as string,
};

const createApplierBody = {
  clubId: '636dbaa3000d027bdcea98e3',
  documentQuestions: [
    '이 동아리에 지원한 계기는 무엇인가요?',
    '자신이 한 일중 가장 멋있는 일은 무엇인가요?',
  ],
  interviewQuestions: ['면접질문1', '면접질문2'],
  appliedUserColumns: [{ key: '트랙', valueType: 'string' }],
};

const agent = request.agent(app); //agent를 이용하면 요청을 지속시킬 수 있다.(쿠키 값 유지 가능) !!!

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
    agent
      .get('/applies/appliers/byClub/6336bbad1c469c4e2329427e')
      .expect(200, done);
  });
});

describe('POST /auth/login', () => {
  test('login', (done) => {
    agent.post('/auth/login').send(testClubLoginInfo).expect(200, done);
  });
});

describe('POST /applies/appliers', () => {
  test('createApplier', (done) => {
    agent.post('/applies/appliers').send(createApplierBody).expect(200, done);
  });
});
