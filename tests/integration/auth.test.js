import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import User from '../../src/models/User.model.js';
import Academy from '../../src/models/Academy.model.js';
import Subscription from '../../src/models/Subscription.model.js';

const TEST_DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/sms_test';

beforeAll(async () => {
  process.env.MONGODB_URI = TEST_DB;
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Academy.deleteMany({});
  await Subscription.deleteMany({});
});

const validRegisterData = {
  academyName: 'Test Academy',
  academyEmail: 'academy@test.com',
  ownerName: 'Test Owner',
  whatsappNumber: '+923001234567',
  adminName: 'Admin User',
  adminEmail: 'admin@test.com',
  password: 'password123',
};

describe('POST /api/v1/auth/register', () => {
  it('should register academy and admin successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validRegisterData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
    expect(res.body.data.academy.email).toBe(validRegisterData.academyEmail);
  });

  it('should reject duplicate academy email', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegisterData);
    const res = await request(app).post('/api/v1/auth/register').send(validRegisterData);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...validRegisterData, academyEmail: 'not-an-email' });
    expect(res.status).toBe(422);
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...validRegisterData, password: '123' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(validRegisterData);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validRegisterData.adminEmail,
      password: validRegisterData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.user.email).toBe(validRegisterData.adminEmail);
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validRegisterData.adminEmail,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nobody@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  let accessToken;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validRegisterData);
    accessToken = regRes.body.data.tokens.accessToken;
  });

  it('should return current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(validRegisterData.adminEmail);
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should reject missing token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
