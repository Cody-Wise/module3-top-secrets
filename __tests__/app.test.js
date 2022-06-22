const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

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

  it('signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(fakeUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.status).toEqual(200);
  });

  it('Deletes session and logs out user', async () => {
    await request(app).post('/api/v1/users').send(fakeUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@test.com', password: '123456' });
    expect(res.status).toEqual(200);
    const res2 = await request(app).delete('/api/v1/users/sessions');
    expect(res2.status).toEqual(200);
  });

  it('Posting to Secrets Fails When Not Logged in', async () => {
    await request(app)
      .post('/api/v1/secrets')
      .send({ title: 'Best Secret', description: 'This is a test secret' });
    const res = await request(app);
    expect(res.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });
  afterAll(() => {
    pool.end();
  });
});
