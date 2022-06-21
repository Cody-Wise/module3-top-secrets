const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

//Fake Account for Testing

const fakeUser = {
  email: 'test@test.com',
  password: '123456',
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(fakeUser);
    const { email } = fakeUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      email,
    });
  });
  afterAll(() => {
    pool.end();
  });
});
