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

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? fakeUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...fakeUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  console.log({ user });
  return [agent, user];
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
    // await request(app).post('/api/v1/users').send(fakeUser);
    // const res = await request(app)
    //   .post('/api/v1/users/sessions')
    //   .send({ email: 'test@test.com', password: '123456' });
    // expect(res.status).toEqual(200);
    const [agent] = await registerAndLogin();
    const res = await agent.delete('/api/v1/users/sessions');
    expect(res.status).toEqual(200);
  });

  it('Posting to Secrets Fails When Not Logged in', async () => {
    const res = await request(app).post('/api/v1/secrets').send({
      title: 'test@example.com',
      description: 'This is a test secret',
    });
    expect(res.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });

  it('Getting all secrets fails when not logged in', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
  });

  it('Posts to secrets when logged in', async () => {
    const [agent] = await registerAndLogin();
    // await request(app).post('/api/v1/users').send(fakeUser);
    // const res = await request(app)
    //   .post('/api/v1/users/sessions')
    //   .send({ email: 'test@test.com', password: '123456' });
    // expect(res.status).toEqual(200);
    const res = await agent.post('/api/v1/secrets').send({
      title: 'test@example.com',
      description: 'This is a test secret',
    });
    expect(res.status).toEqual(200);
  });
  it('Get All Secrets when logged in', async () => {
    const [agent] = await registerAndLogin();
    // await request(app).post('/api/v1/users').send(fakeUser);
    // const res = await request(app)
    //   .post('/api/v1/users/sessions')
    //   .send({ email: 'test@test.com', password: '123456' });
    // expect(res.status).toEqual(200);
    await agent.post('/api/v1/secrets').send({
      title: 'test@example.com',
      description: 'This is a test secret',
    });
    const res = await agent.get('/api/v1/secrets');

    console.log('res.body', res.body);
    expect(res.body[0]).toEqual({
      title: 'test@example.com',
      description: 'This is a test secret',
      created_at: expect.any(String),
    });
  });
  afterAll(() => {
    pool.end();
  });
});
