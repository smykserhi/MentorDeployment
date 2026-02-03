const express = require('express');
const request = require('supertest');
const jobsRouter = require('./jobs');
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobs');

jest.mock('../controllers/jobs');

describe('Jobs Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/jobs', jobsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/v1/jobs', () => {
    it('should call getAllJobs controller', async () => {
      getAllJobs.mockImplementation((req, res) => {
        res.status(200).json({ jobs: [], count: 0 });
      });

      const response = await request(app).get('/api/v1/jobs');

      expect(getAllJobs).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/jobs', () => {
    it('should call createJob controller', async () => {
      createJob.mockImplementation((req, res) => {
        res.status(201).json({ job: { id: 1 } });
      });

      const response = await request(app)
        .post('/api/v1/jobs')
        .send({ company: 'Test Co', position: 'Developer' });

      expect(createJob).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('should call getJob controller', async () => {
      getJob.mockImplementation((req, res) => {
        res.status(200).json({ job: { id: 1 } });
      });

      const response = await request(app).get('/api/v1/jobs/123');

      expect(getJob).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/jobs/:id', () => {
    it('should call updateJob controller', async () => {
      updateJob.mockImplementation((req, res) => {
        res.status(200).json({ job: { id: 1 } });
      });

      const response = await request(app)
        .patch('/api/v1/jobs/123')
        .send({ status: 'interview' });

      expect(updateJob).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/jobs/:id', () => {
    it('should call deleteJob controller', async () => {
      deleteJob.mockImplementation((req, res) => {
        res.status(200).json({ msg: 'Job deleted' });
      });

      const response = await request(app).delete('/api/v1/jobs/123');

      expect(deleteJob).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });
});
