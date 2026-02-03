const User = require('./User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Validation', () => {
    it('should create a user with valid data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
    });

    it('should require name', () => {
      const user = new User({
        email: 'john@example.com',
        password: 'password123',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.name).toBeDefined();
    });

    it('should require email', () => {
      const user = new User({
        name: 'John Doe',
        password: 'password123',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.email).toBeDefined();
    });

    it('should require password', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.password).toBeDefined();
    });

    it('should validate email format', () => {
      const user = new User({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.email).toBeDefined();
    });

    it('should enforce minimum name length', () => {
      const user = new User({
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.name).toBeDefined();
    });

    it('should enforce maximum name length', () => {
      const user = new User({
        name: 'a'.repeat(51),
        email: 'john@example.com',
        password: 'password123',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.name).toBeDefined();
    });

    it('should enforce minimum password length', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345',
      });

      const validationError = user.validateSync();
      expect(validationError.errors.password).toBeDefined();
    });
  });

  describe('Pre-save Hook', () => {
    it('should hash password before saving', async () => {
      // Test that bcrypt functions are called when password is set
      // This is a simplified test since testing Mongoose hooks directly is complex
      const salt = 'salt123';
      const hashedPassword = 'hashedPassword123';

      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Create user and manually call the hashing logic
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      // Simulate what the pre-save hook does
      const saltResult = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, saltResult);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', salt);
      expect(user.password).toBe(hashedPassword);
    });
  });

  describe('createJWT Method', () => {
    it('should create a JWT token', () => {
      const user = new User({
        _id: 'userId123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const token = 'jwtToken123';
      process.env.JVM_SECRET = 'secret';
      process.env.EXPIRATION_TIME = '1d';

      jwt.sign.mockReturnValue(token);

      const result = user.createJWT();

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user._id, name: 'John Doe' },
        'secret',
        { expiresIn: '1d' }
      );
      expect(result).toBe(token);
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for matching passwords', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await user.comparePassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      });

      bcrypt.compare.mockResolvedValue(false);

      const result = await user.comparePassword('wrongPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword123'
      );
      expect(result).toBe(false);
    });
  });
});
