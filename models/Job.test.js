const Job = require('./Job');
const mongoose = require('mongoose');

describe('Job Model', () => {
  describe('Schema Validation', () => {
    it('should create a job with valid data', () => {
      const jobData = {
        company: 'Tech Corp',
        position: 'Software Engineer',
        status: 'pending',
        createdBy: new mongoose.Types.ObjectId(),
      };

      const job = new Job(jobData);
      expect(job.company).toBe(jobData.company);
      expect(job.position).toBe(jobData.position);
      expect(job.status).toBe(jobData.status);
      expect(job.createdBy).toEqual(jobData.createdBy);
    });

    it('should require company', () => {
      const job = new Job({
        position: 'Software Engineer',
        createdBy: new mongoose.Types.ObjectId(),
      });

      const validationError = job.validateSync();
      expect(validationError.errors.company).toBeDefined();
    });

    it('should require position', () => {
      const job = new Job({
        company: 'Tech Corp',
        createdBy: new mongoose.Types.ObjectId(),
      });

      const validationError = job.validateSync();
      expect(validationError.errors.position).toBeDefined();
    });

    it('should require createdBy', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'Software Engineer',
      });

      const validationError = job.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.createdBy).toBeDefined();
    });

    it('should enforce maximum company length', () => {
      const job = new Job({
        company: 'a'.repeat(51),
        position: 'Software Engineer',
        createdBy: new mongoose.Types.ObjectId(),
      });

      const validationError = job.validateSync();
      expect(validationError.errors.company).toBeDefined();
    });

    it('should enforce maximum position length', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'a'.repeat(101),
        createdBy: new mongoose.Types.ObjectId(),
      });

      const validationError = job.validateSync();
      expect(validationError.errors.position).toBeDefined();
    });

    it('should validate status enum values', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'Software Engineer',
        status: 'invalid',
        createdBy: new mongoose.Types.ObjectId(),
      });

      const validationError = job.validateSync();
      expect(validationError.errors.status).toBeDefined();
    });

    it('should accept valid status values', () => {
      const validStatuses = ['pending', 'interview', 'declined'];

      validStatuses.forEach((status) => {
        const job = new Job({
          company: 'Tech Corp',
          position: 'Software Engineer',
          status,
          createdBy: new mongoose.Types.ObjectId(),
        });

        const validationError = job.validateSync();
        expect(validationError).toBeUndefined();
      });
    });
  });

  describe('Default Values', () => {
    it('should set default status to pending', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'Software Engineer',
        createdBy: new mongoose.Types.ObjectId(),
      });

      expect(job.status).toBe('pending');
    });
  });

  describe('Timestamps', () => {
    it('should have timestamps enabled in schema', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'Software Engineer',
        createdBy: new mongoose.Types.ObjectId(),
      });

      // Check that the schema has timestamps enabled
      expect(job.schema.options.timestamps).toBe(true);
    });
  });

  describe('References', () => {
    it('should reference User model', () => {
      const job = new Job({
        company: 'Tech Corp',
        position: 'Software Engineer',
        createdBy: new mongoose.Types.ObjectId(),
      });

      expect(job.schema.path('createdBy').options.ref).toBe('User');
    });
  });
});
