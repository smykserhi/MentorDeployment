const mongoose = require('mongoose');
const path = require('path');
const { randomUUID } = require('crypto');
const { Readable } = require('stream');
const { BadRequestError } = require('../errors');

const ALLOWED_IMAGE_TYPES = (
  process.env.IMAGE_ALLOWED_MIME_TYPES ||
  'image/jpeg,image/png,image/webp,image/gif'
)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const IMAGE_MAX_SIZE_BYTES =
  Number(process.env.IMAGE_MAX_SIZE_MB || 5) * 1024 * 1024;

const getBucket = () => {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('Database connection is not initialized');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images',
  });
};

const validateImageFile = (file) => {
  if (!file) {
    throw new BadRequestError('Please provide image file');
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new BadRequestError('Unsupported file type');
  }
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    const maxSizeMb = IMAGE_MAX_SIZE_BYTES / (1024 * 1024);
    throw new BadRequestError(`File is too large. Max size is ${maxSizeMb}MB`);
  }
};

const generateFileName = (originalname) => {
  const ext = path.extname(originalname || '');
  return `${randomUUID()}${ext}`;
};

const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    validateImageFile(file);

    const bucket = getBucket();
    const filename = generateFileName(file.originalname);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: { originalname: file.originalname },
    });

    const source = Readable.from(file.buffer);

    source.on('error', reject);
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        filename,
        contentType: file.mimetype,
        size: file.size,
      });
    });

    source.pipe(uploadStream);
  });

const openDownloadStream = (fileId) => {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

const deleteImage = async (fileId) => {
  const bucket = getBucket();
  try {
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
};

module.exports = {
  uploadImage,
  openDownloadStream,
  deleteImage,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  IMAGE_MAX_SIZE_BYTES,
};
