const express = require('express');
const request = require('supertest');
const authRouter = require('./auth');
const { register, login } = require('../controllers/auth');

jest.mock('../controllers/auth');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should call register controller', async () => {
      register.mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'John',
        email: 'john@example.com',
        password: 'password',
      });

      expect(register).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should call login controller', async () => {
      login.mockImplementation((req, res) => {
        res.status(200).json({ message: 'User logged in' });
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'password' });

      expect(login).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });
});
