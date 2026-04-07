const mongoose = require('mongoose');
const Image = require('./Image');

describe('Image Model', () => {
  it('should create image metadata with valid data', () => {
    const image = new Image({
      ownerType: 'user',
      ownerId: new mongoose.Types.ObjectId(),
      fileId: new mongoose.Types.ObjectId(),
      filename: 'abc.png',
      contentType: 'image/png',
      size: 1024,
      uploadedBy: new mongoose.Types.ObjectId(),
    });

    const validationError = image.validateSync();
    expect(validationError).toBeUndefined();
  });

  it('should enforce ownerType enum values', () => {
    const image = new Image({
      ownerType: 'profile',
      ownerId: new mongoose.Types.ObjectId(),
      fileId: new mongoose.Types.ObjectId(),
      filename: 'abc.png',
      contentType: 'image/png',
      size: 1024,
      uploadedBy: new mongoose.Types.ObjectId(),
    });

    const validationError = image.validateSync();
    expect(validationError.errors.ownerType).toBeDefined();
  });

  it('should require required fields', () => {
    const image = new Image({});
    const validationError = image.validateSync();

    expect(validationError.errors.ownerType).toBeDefined();
    expect(validationError.errors.ownerId).toBeDefined();
    expect(validationError.errors.fileId).toBeDefined();
    expect(validationError.errors.filename).toBeDefined();
    expect(validationError.errors.contentType).toBeDefined();
    expect(validationError.errors.size).toBeDefined();
    expect(validationError.errors.uploadedBy).toBeDefined();
  });
});
