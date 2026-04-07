const express = require('express');
const multer = require('multer');
const {
  uploadUserImage,
  getUserImage,
  deleteUserImage,
  uploadJobImage,
  getJobImage,
  deleteJobImage,
} = require('../controllers/images');
const { IMAGE_MAX_SIZE_BYTES } = require('../services/imageStorage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX_SIZE_BYTES },
});

router
  .route('/users/:userId')
  .post(upload.single('image'), uploadUserImage)
  .get(getUserImage)
  .delete(deleteUserImage);

router
  .route('/jobs/:jobId')
  .post(upload.single('image'), uploadJobImage)
  .get(getJobImage)
  .delete(deleteJobImage);

module.exports = router;
