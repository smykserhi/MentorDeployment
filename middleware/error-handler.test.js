const errorHandlerMiddleware = require('./error-handler');
const { StatusCodes } = require('http-status-codes');

describe('Error Handler Middleware', () => {
  // eslint-disable-next-line no-unused-vars
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle ValidationError', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' },
      },
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Name is required, Email is invalid',
    });
  });

  it('should handle CastError', () => {
    const err = {
      name: 'CastError',
      value: 'invalidId',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'No item found with id : invalidId',
    });
  });

  it('should handle duplicate key error (code 11000)', () => {
    const err = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Duplicate value entered for email field, please choose another value',
    });
  });

  it('should handle error with statusCode', () => {
    const err = {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Bad request error',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Bad request error' });
  });

  it('should handle error without statusCode', () => {
    const err = {
      message: 'Generic error',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Generic error' });
  });

  it('should handle error without message', () => {
    const err = {};

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Something went wrong try again later',
    });
  });

  it('should handle multer file size limit errors', () => {
    const err = {
      name: 'MulterError',
      code: 'LIMIT_FILE_SIZE',
      message: 'File too large',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.REQUEST_TOO_LONG);
    expect(res.json).toHaveBeenCalledWith({ msg: 'File is too large' });
  });
});
