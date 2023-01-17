import { agent, usingClubId, testAdminLoginInfo } from '../globalInfo';
import { User } from '../../src/types/user';

const createApplierBody = {
  clubId: usingClubId,
  documentQuestions: [],
  interviewQuestions: ['면접질문1', '면접질문2'],
  appliedUserColumns: [
    { key: '트랙', valueType: 'string' },
    { key: '학년', valueType: 'number' },
  ],
};

describe('AppliedUser CRUD: 해당 동아리에 Applier가 없을 경우만 사용 가능', () => {
  let userInfo: User;
  describe('POST /auth/login', () => {
    test('1. 로그인한다.', (done) => {
      agent.post('/auth/login').send(testAdminLoginInfo).expect(200, done);
    });
  });

  describe('POST /auth/verify', () => {
    test('2. 유저의 정보를 확인한다.', (done) => {
      agent
        .post('/auth/verify')
        .expect(({ body }) => (userInfo = body.data.authUser))
        .expect(200, done);
    });
  });

  describe('POST /applies/appliers', () => {
    test('3. 지원양식을 생성한다.', (done) => {
      agent.post('/applies/appliers').send(createApplierBody).expect(200, done);
    });
  });

  describe('POST /applies/appliedUsers', () => {
    test('4. 지원자를 생성한다.', (done) => {
      const createAppliedUserInfo = {
        ...userInfo,
        clubId: usingClubId,
        clubName: '멋쟁이고릴라처럼',
      };
      agent
        .post('/applies/appliedUsers')
        .send(createAppliedUserInfo)
        .expect(({ body }) => console.log(body))
        .expect(200, done);
    });
  });
});
