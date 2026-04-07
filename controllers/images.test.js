const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const {
  uploadUserImage,
  uploadJobImage,
  deleteUserImage,
  getJobImage,
} = require('./images');
const User = require('../models/User');
const Job = require('../models/Job');
const Image = require('../models/Image');
const { uploadImage, openDownloadStream, deleteImage } = require('../services/imageStorage');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors');

jest.mock('../models/User');
jest.mock('../models/Job');
jest.mock('../models/Image');
jest.mock('../services/imageStorage');

describe('Images Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {},
      user: { userId: new mongoose.Types.ObjectId().toString() },
      file: {
        mimetype: 'image/png',
        size: 1024,
        originalname: 'test.png',
        buffer: Buffer.from('123'),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('uploads user image for owner', async () => {
    const userId = req.user.userId;
    const fileId = new mongoose.Types.ObjectId();
    req.params.userId = userId;
    User.findById.mockResolvedValue({ _id: userId });
    uploadImage.mockResolvedValue({
      fileId,
      filename: 'new.png',
      contentType: 'image/png',
      size: 1024,
    });
    Image.findOne.mockResolvedValue(null);
    Image.findOneAndUpdate.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      ownerType: 'user',
      ownerId: userId,
      filename: 'new.png',
      contentType: 'image/png',
      size: 1024,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await uploadUserImage(req, res);

    expect(uploadImage).toHaveBeenCalledWith(req.file);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalled();
  });

  it('rejects uploading another user image', async () => {
    req.params.userId = new mongoose.Types.ObjectId().toString();

    await expect(uploadUserImage(req, res)).rejects.toThrow(UnauthenticatedError);
  });

  it('replaces job image and deletes previous file', async () => {
    const jobId = new mongoose.Types.ObjectId().toString();
    const oldFileId = new mongoose.Types.ObjectId();
    req.params.jobId = jobId;
    Job.findOne.mockResolvedValue({ _id: jobId, createdBy: req.user.userId });
    uploadImage.mockResolvedValue({
      fileId: new mongoose.Types.ObjectId(),
      filename: 'new-job.png',
      contentType: 'image/png',
      size: 2000,
    });
    Image.findOne.mockResolvedValue({ fileId: oldFileId });
    Image.findOneAndUpdate.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      ownerType: 'job',
      ownerId: jobId,
      filename: 'new-job.png',
      contentType: 'image/png',
      size: 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await uploadJobImage(req, res);

    expect(deleteImage).toHaveBeenCalledWith(oldFileId);
  });

  it('bubbles validation failures from storage service', async () => {
    const userId = req.user.userId;
    req.params.userId = userId;
    User.findById.mockResolvedValue({ _id: userId });
    uploadImage.mockRejectedValue(new BadRequestError('Unsupported file type'));

    await expect(uploadUserImage(req, res)).rejects.toThrow(BadRequestError);
  });

  it('streams job image when owner has access', async () => {
    const jobId = new mongoose.Types.ObjectId().toString();
    const fileId = new mongoose.Types.ObjectId();
    req.params.jobId = jobId;
    Job.findOne.mockResolvedValue({ _id: jobId, createdBy: req.user.userId });
    Image.findOne.mockResolvedValue({
      fileId,
      contentType: 'image/png',
      size: 1200,
    });
    const stream = { on: jest.fn(), pipe: jest.fn() };
    openDownloadStream.mockReturnValue(stream);

    await getJobImage(req, res);

    expect(openDownloadStream).toHaveBeenCalledWith(fileId);
    expect(stream.pipe).toHaveBeenCalledWith(res);
  });

  it('returns not found when deleting missing image', async () => {
    const userId = req.user.userId;
    req.params.userId = userId;
    User.findById.mockResolvedValue({ _id: userId });
    Image.findOneAndDelete.mockResolvedValue(null);

    await expect(deleteUserImage(req, res)).rejects.toThrow(NotFoundError);
  });
});
