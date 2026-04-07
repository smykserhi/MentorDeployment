const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Job = require('../models/Job');
const User = require('../models/User');
const Image = require('../models/Image');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { uploadImage, openDownloadStream, deleteImage } = require('../services/imageStorage');

const toImageResponse = (imageDoc) => ({
  id: imageDoc._id,
  ownerType: imageDoc.ownerType,
  ownerId: imageDoc.ownerId,
  contentType: imageDoc.contentType,
  size: imageDoc.size,
  filename: imageDoc.filename,
  createdAt: imageDoc.createdAt,
  updatedAt: imageDoc.updatedAt,
  url: `/api/v1/images/${imageDoc.ownerType}s/${imageDoc.ownerId}`,
});

const assertValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Please provide valid ${label}`);
  }
};

const assertUserOwner = async (userId, authenticatedUserId) => {
  assertValidObjectId(userId, 'user id');
  if (String(userId) !== String(authenticatedUserId)) {
    throw new UnauthenticatedError('Not authorized to access this image');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`No user with id : ${userId}`);
  }
};

const assertJobOwner = async (jobId, authenticatedUserId) => {
  assertValidObjectId(jobId, 'job id');
  const job = await Job.findOne({ _id: jobId, createdBy: authenticatedUserId });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
};

const replaceOwnerImage = async (ownerType, ownerId, reqUserId, file) => {
  const uploaded = await uploadImage(file);
  const existing = await Image.findOne({ ownerType, ownerId });

  const image = await Image.findOneAndUpdate(
    { ownerType, ownerId },
    {
      ownerType,
      ownerId,
      fileId: uploaded.fileId,
      filename: uploaded.filename,
      contentType: uploaded.contentType,
      size: uploaded.size,
      uploadedBy: reqUserId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  if (existing && existing.fileId) {
    await deleteImage(existing.fileId);
  }

  return image;
};

const streamOwnerImage = async (ownerType, ownerId, res) => {
  const image = await Image.findOne({ ownerType, ownerId });
  if (!image) {
    throw new NotFoundError('Image not found');
  }

  res.setHeader('Content-Type', image.contentType);
  res.setHeader('Content-Length', image.size);
  res.setHeader('Cache-Control', 'private, max-age=300');

  const downloadStream = openDownloadStream(image.fileId);
  downloadStream.on('error', () => {
    res.status(StatusCodes.NOT_FOUND).json({ msg: 'Image content not found' });
  });

  downloadStream.pipe(res);
};

const deleteOwnerImage = async (ownerType, ownerId) => {
  const image = await Image.findOneAndDelete({ ownerType, ownerId });
  if (!image) {
    throw new NotFoundError('Image not found');
  }
  await deleteImage(image.fileId);
};

const uploadUserImage = async (req, res) => {
  const { userId } = req.params;
  await assertUserOwner(userId, req.user.userId);
  const image = await replaceOwnerImage('user', userId, req.user.userId, req.file);
  res.status(StatusCodes.CREATED).json({ image: toImageResponse(image) });
};

const getUserImage = async (req, res) => {
  const { userId } = req.params;
  await assertUserOwner(userId, req.user.userId);
  await streamOwnerImage('user', userId, res);
};

const deleteUserImage = async (req, res) => {
  const { userId } = req.params;
  await assertUserOwner(userId, req.user.userId);
  await deleteOwnerImage('user', userId);
  res.status(StatusCodes.OK).json({ msg: 'Image deleted successfully' });
};

const uploadJobImage = async (req, res) => {
  const { jobId } = req.params;
  await assertJobOwner(jobId, req.user.userId);
  const image = await replaceOwnerImage('job', jobId, req.user.userId, req.file);
  res.status(StatusCodes.CREATED).json({ image: toImageResponse(image) });
};

const getJobImage = async (req, res) => {
  const { jobId } = req.params;
  await assertJobOwner(jobId, req.user.userId);
  await streamOwnerImage('job', jobId, res);
};

const deleteJobImage = async (req, res) => {
  const { jobId } = req.params;
  await assertJobOwner(jobId, req.user.userId);
  await deleteOwnerImage('job', jobId);
  res.status(StatusCodes.OK).json({ msg: 'Image deleted successfully' });
};

module.exports = {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  uploadJobImage,
  getJobImage,
  deleteJobImage,
};
