const auth = require('./authentication');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() with valid token', async () => {
    const token = 'validToken';
    const payload = { userId: 'userId123', name: 'John Doe' };

    req.headers.authorization = `Bearer ${token}`;
    process.env.JVM_SECRET = 'secret';

    jwt.verify.mockReturnValue(payload);

    await auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, 'secret');
    expect(req.user).toEqual({ userId: 'userId123', name: 'John Doe' });
    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthenticatedError if no authorization header', async () => {
    await expect(auth(req, res, next)).rejects.toThrow(UnauthenticatedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthenticatedError if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic token123';

    await expect(auth(req, res, next)).rejects.toThrow(UnauthenticatedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthenticatedError for invalid token', async () => {
    const token = 'invalidToken';
    req.headers.authorization = `Bearer ${token}`;
    process.env.JVM_SECRET = 'secret';

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(auth(req, res, next)).rejects.toThrow(UnauthenticatedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthenticatedError for expired token', async () => {
    const token = 'expiredToken';
    req.headers.authorization = `Bearer ${token}`;
    process.env.JVM_SECRET = 'secret';

    jwt.verify.mockImplementation(() => {
      throw new jwt.TokenExpiredError('Token expired', new Date());
    });

    await expect(auth(req, res, next)).rejects.toThrow(UnauthenticatedError);
    expect(next).not.toHaveBeenCalled();
  });
});
