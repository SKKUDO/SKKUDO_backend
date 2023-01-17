import { agent, usingClubId, testAdminLoginInfo } from '../globalInfo';

const createApplierBody = {
  clubId: usingClubId,
  documentQuestions: [],
  interviewQuestions: ['면접질문1', '면접질문2'],
  appliedUserColumns: [
    { key: '트랙', valueType: 'string' },
    { key: '학년', valueType: 'number' },
  ],
};

describe('Applier CRUD: 해당 동아리에 Applier가 없을 경우만 사용 가능', () => {
  describe('POST /auth/login', () => {
    test('1. 로그인한다.', (done) => {
      agent.post('/auth/login').send(testAdminLoginInfo).expect(200, done);
    });
  });

  describe('GET /appliers', () => {
    test('2. 모든 지원양식을 가져온다.', (done) => {
      agent.get('/applies/appliers').expect(200, done);
    });
  });

  describe('POST /applies/appliers', () => {
    test('3. 지원양식을 생성한다.', (done) => {
      agent.post('/applies/appliers').send(createApplierBody).expect(200, done);
    });
  });

  describe('GET /applies/appliers/byClub/:clubId', () => {
    test('4. 해당 동아리 내의 지원양식을 가져온다.', (done) => {
      agent.get(`/applies/appliers/byClub/${usingClubId}`).expect(200, done);
    });
  });

  describe(`PATCH /applies/appliers`, () => {
    test('5. 생성한 지원양식을 수정한다.', (done) => {
      agent
        .patch(`/applies/appliers/${usingClubId}`)
        .send({ documentQuestions: ['a'] })
        .expect(200, done);
    });
  });

  describe('DELETE /applies/appliers', () => {
    test('6. 생성한 지원양식을 삭제한다.', (done) => {
      agent.delete(`/applies/appliers/${usingClubId}`).expect(200, done);
    });
  });
});
