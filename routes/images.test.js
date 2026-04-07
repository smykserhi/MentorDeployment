const express = require('express');
const request = require('supertest');
const imagesRouter = require('./images');
const {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  uploadJobImage,
  getJobImage,
  deleteJobImage,
} = require('../controllers/images');

jest.mock('../controllers/images');

describe('Images Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api/v1/images', imagesRouter);
    jest.clearAllMocks();
  });

  it('calls uploadUserImage controller', async () => {
    uploadUserImage.mockImplementation((req, res) => {
      res.status(201).json({ image: { id: '1' } });
    });

    const response = await request(app)
      .post('/api/v1/images/users/123')
      .attach('image', Buffer.from('hello'), 'test.png');

    expect(uploadUserImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(201);
  });

  it('calls getUserImage controller', async () => {
    getUserImage.mockImplementation((req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get('/api/v1/images/users/123');

    expect(getUserImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('calls deleteUserImage controller', async () => {
    deleteUserImage.mockImplementation((req, res) => {
      res.status(200).json({ msg: 'ok' });
    });

    const response = await request(app).delete('/api/v1/images/users/123');

    expect(deleteUserImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('calls uploadJobImage controller', async () => {
    uploadJobImage.mockImplementation((req, res) => {
      res.status(201).json({ image: { id: '1' } });
    });

    const response = await request(app)
      .post('/api/v1/images/jobs/123')
      .attach('image', Buffer.from('hello'), 'test.png');

    expect(uploadJobImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(201);
  });

  it('calls getJobImage controller', async () => {
    getJobImage.mockImplementation((req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get('/api/v1/images/jobs/123');

    expect(getJobImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('calls deleteJobImage controller', async () => {
    deleteJobImage.mockImplementation((req, res) => {
      res.status(200).json({ msg: 'ok' });
    });

    const response = await request(app).delete('/api/v1/images/jobs/123');

    expect(deleteJobImage).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
