const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ['user', 'job'],
      required: [true, 'Please provide owner type'],
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Please provide owner id'],
    },
    fileId: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Please provide file id'],
    },
    filename: {
      type: String,
      required: [true, 'Please provide filename'],
      trim: true,
    },
    contentType: {
      type: String,
      required: [true, 'Please provide content type'],
    },
    size: {
      type: Number,
      required: [true, 'Please provide file size'],
      min: [1, 'Image size must be greater than zero'],
    },
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide uploader'],
    },
  },
  { timestamps: true }
);

imageSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });
imageSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Image', imageSchema);
