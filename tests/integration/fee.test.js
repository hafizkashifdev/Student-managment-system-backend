import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import User from '../../src/models/User.model.js';
import Academy from '../../src/models/Academy.model.js';
import Student from '../../src/models/Student.model.js';
import FeePlan from '../../src/models/Fee.model.js';
import FeePayment from '../../src/models/FeePayment.model.js';
import Subscription from '../../src/models/Subscription.model.js';

beforeAll(async () => { await connectDB(); });
afterAll(async () => { await mongoose.connection.dropDatabase(); await disconnectDB(); });
beforeEach(async () => {
  await Promise.all([
    Student.deleteMany({}), User.deleteMany({}), Academy.deleteMany({}),
    FeePlan.deleteMany({}), FeePayment.deleteMany({}), Subscription.deleteMany({}),
  ]);
});

const setup = async () => {
  const regRes = await request(app).post('/api/v1/auth/register').send({
    academyName: 'Fee Test Academy',
    academyEmail: `fee_${Date.now()}@test.com`,
    ownerName: 'Owner',
    whatsappNumber: '+923001234567',
    adminName: 'Admin',
    adminEmail: `fee_admin_${Date.now()}@test.com`,
    password: 'password123',
  });
  return regRes.body.data.tokens.accessToken;
};

describe('Fee Plans', () => {
  it('should create a fee plan', async () => {
    const token = await setup();
    const res = await request(app)
      .post('/api/v1/fees/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Monthly Plan', amount: 2000, dueDay: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(2000);
  });

  it('should list fee plans', async () => {
    const token = await setup();
    await request(app).post('/api/v1/fees/plans').set('Authorization', `Bearer ${token}`).send({ name: 'Plan A', amount: 1500 });

    const res = await request(app).get('/api/v1/fees/plans').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Fee Summary', () => {
  it('should return fee summary for current month', async () => {
    const token = await setup();
    const res = await request(app).get('/api/v1/fees/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalCollected');
    expect(res.body.data).toHaveProperty('collectionRate');
  });
});
