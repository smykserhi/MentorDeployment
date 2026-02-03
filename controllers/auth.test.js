const { register, login } = require('../../controllers/auth');
const User = require('../../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../../errors');

jest.mock('../../models/User');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      req.body = { name: 'test', email: 'test@example.com', password: 'password' };
      const mockUser = {
        _id: 'userId',
        name: 'test',
        email: 'test@example.com',
        createJWT: jest.fn().mockReturnValue('jwt_token'),
      };
      User.create.mockResolvedValue(mockUser);

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        user: { name: mockUser.name },
        token: 'jwt_token',
      });
    });

    it('should throw BadRequestError if name, email, or password is missing', async () => {
      req.body = { name: 'test' }; // Missing email and password

      await expect(register(req, res)).rejects.toThrow(BadRequestError);
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      const mockUser = {
        name: 'test',
        comparePassword: jest.fn().mockResolvedValue(true),
        createJWT: jest.fn().mockReturnValue('jwt_token'),
      };
      User.findOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(req.body.password);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        user: { name: mockUser.name },
        token: 'jwt_token',
      });
    });

    it('should throw BadRequestError if email or password is missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password

      await expect(login(req, res)).rejects.toThrow(BadRequestError);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if user is not found', async () => {
      req.body = { email: 'wrong@example.com', password: 'password' };
      User.findOne.mockResolvedValue(null);

      await expect(login(req, res)).rejects.toThrow(BadRequestError);
      // Verify it throws "Invalid Credentials" specifically if needed, but checking type is usually sufficient
    });

    it('should throw UnauthenticatedError if password is incorrect', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(mockUser);

      await expect(login(req, res)).rejects.toThrow(UnauthenticatedError);
    });
  });
});