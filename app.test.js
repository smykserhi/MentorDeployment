/* eslint-disable no-unused-vars */
const request = require('supertest');
const express = require('express');

// Mock all the dependencies
jest.mock('dotenv');
jest.mock('express-async-errors');
jest.mock('helmet', () => jest.fn(() => (req, res, next) => next()));
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));
jest.mock('xss-clean', () => jest.fn(() => (req, res, next) => next()));
jest.mock('express-rate-limit', () =>
  jest.fn(() => (req, res, next) => next())
);
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn((req, res, next) => next()),
  setup: jest.fn(() => jest.fn((req, res, next) => next())),
}));
jest.mock('yamljs', () => ({
  load: jest.fn(() => ({ version: '1.0.0' })),
}));
jest.mock('./db/connect');
jest.mock('./routes/auth', () => jest.fn());
jest.mock('./routes/jobs', () => jest.fn());
jest.mock('./routes/images', () => jest.fn());
jest.mock('./middleware/not-found', () => jest.fn());
jest.mock('./middleware/error-handler', () => jest.fn());
jest.mock('./middleware/authentication', () => jest.fn());

const connectDB = require('./db/connect');
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
const imagesRouter = require('./routes/images');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authMiddleware = require('./middleware/authentication');

// Import app after mocking
const { app } = require('./app');

describe('Express App', () => {
  describe('Routes', () => {
    it('should respond to GET /', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Hello world!');
    });
  });
});
