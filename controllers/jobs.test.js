const { getAllJobs, getJob, createJob, updateJob, deleteJob } = require('./jobs');
const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

jest.mock('../models/Job');

describe('Jobs Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: 'userId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAllJobs', () => {
    it('should return all jobs for the user', async () => {
      const mockJobs = [{ _id: '1', company: 'Test Co' }];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockJobs)
      };
      Job.find.mockReturnValue(mockQuery);

      await getAllJobs(req, res);

      expect(Job.find).toHaveBeenCalledWith({ createdBy: req.user.userId });
      expect(mockQuery.sort).toHaveBeenCalledWith('createdAt');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ jobs: mockJobs, count: mockJobs.length });
    });
  });

  describe('getJob', () => {
    it('should return a specific job', async () => {
      req.params.id = 'jobId';
      const mockJob = { _id: 'jobId', company: 'Test Co' };
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockJob)
      };
      Job.findOne.mockReturnValue(mockQuery);

      await getJob(req, res);

      expect(Job.findOne).toHaveBeenCalledWith({ createdBy: req.user.userId, _id: 'jobId' });
      expect(mockQuery.sort).toHaveBeenCalledWith('createdAt');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should throw BadRequestError if id is missing', async () => {
      req.params.id = '';

      await expect(getJob(req, res)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if job not found', async () => {
      req.params.id = 'jobId';
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(null)
      };
      Job.findOne.mockReturnValue(mockQuery);

      await expect(getJob(req, res)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createJob', () => {
    it('should create a new job', async () => {
      req.body = { company: 'Test Co', position: 'Developer' };
      const mockJob = { _id: 'jobId', company: 'Test Co', position: 'Developer', createdBy: req.user.userId };
      Job.create.mockResolvedValue(mockJob);

      await createJob(req, res);

      expect(Job.create).toHaveBeenCalledWith({ company: 'Test Co', position: 'Developer', createdBy: req.user.userId });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      req.body = { company: 'Test Co' }; // Missing position

      await expect(createJob(req, res)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateJob', () => {
    it('should update a job', async () => {
      req.params.id = 'jobId';
      req.body = { status: 'interview', company: 'New Co' };
      const mockJob = { _id: 'jobId', status: 'interview', company: 'New Co' };
      Job.findOneAndUpdate.mockResolvedValue(mockJob);

      await updateJob(req, res);

      expect(Job.findOneAndUpdate).toHaveBeenCalledWith(
        { createdBy: req.user.userId, _id: 'jobId' },
        { status: 'interview', company: 'New Co' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should throw BadRequestError if id is missing', async () => {
      req.params.id = '';

      await expect(updateJob(req, res)).rejects.toThrow(BadRequestError);
    });

    it('should return 400 if status is missing', async () => {
      req.params.id = 'jobId';
      req.body = { company: 'New Co' }; // Missing status

      await updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Please provide status field to update' });
    });

    it('should return 404 if job not found', async () => {
      req.params.id = 'jobId';
      req.body = { status: 'interview' };
      Job.findOneAndUpdate.mockResolvedValue(null);

      await updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No job with id : jobId' });
    });
  });

  describe('deleteJob', () => {
    it('should delete a job', async () => {
      req.params.id = 'jobId';
      const mockJob = { _id: 'jobId' };
      Job.findOneAndDelete.mockResolvedValue(mockJob);

      await deleteJob(req, res);

      expect(Job.findOneAndDelete).toHaveBeenCalledWith({ createdBy: req.user.userId, _id: 'jobId' });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Job deleted successfully' });
    });

    it('should throw BadRequestError if id is missing', async () => {
      req.params.id = '';

      await expect(deleteJob(req, res)).rejects.toThrow(BadRequestError);
    });

    it('should return 404 if job not found', async () => {
      req.params.id = 'jobId';
      Job.findOneAndDelete.mockResolvedValue(null);

      await deleteJob(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ msg: 'No job with id : jobId' });
    });
  });
});