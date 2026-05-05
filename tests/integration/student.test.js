import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import User from '../../src/models/User.model.js';
import Academy from '../../src/models/Academy.model.js';
import Student from '../../src/models/Student.model.js';
import Subscription from '../../src/models/Subscription.model.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

beforeEach(async () => {
  await Student.deleteMany({});
  await User.deleteMany({});
  await Academy.deleteMany({});
  await Subscription.deleteMany({});
});

const registerAndLogin = async () => {
  const regRes = await request(app).post('/api/v1/auth/register').send({
    academyName: 'Student Test Academy',
    academyEmail: `academy_${Date.now()}@test.com`,
    ownerName: 'Owner',
    whatsappNumber: '+923001234567',
    adminName: 'Admin',
    adminEmail: `admin_${Date.now()}@test.com`,
    password: 'password123',
  });
  return regRes.body.data.tokens.accessToken;
};

const validStudent = {
  name: 'Ahmed Ali',
  gender: 'male',
  parent: { primaryWhatsapp: '+923009876543', fatherName: 'Ali Khan' },
};

describe('POST /api/v1/students', () => {
  it('should create a student', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${token}`)
      .send(validStudent);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(validStudent.name);
    expect(res.body.data).toHaveProperty('studentId');
  });

  it('should reject missing required fields', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Student' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/students', () => {
  it('should list students with pagination', async () => {
    const token = await registerAndLogin();
    await request(app).post('/api/v1/students').set('Authorization', `Bearer ${token}`).send(validStudent);
    await request(app).post('/api/v1/students').set('Authorization', `Bearer ${token}`).send({ ...validStudent, name: 'Fatima Bibi' });

    const res = await request(app)
      .get('/api/v1/students?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination.total).toBe(2);
  });
});
