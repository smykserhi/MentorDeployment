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

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });

  it('should handle CastError', () => {
    const err = {
      name: 'CastError',
      value: 'invalidId',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });

  it('should handle duplicate key error (code 11000)', () => {
    const err = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });

  it('should handle error with statusCode', () => {
    const err = {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Bad request error',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });

  it('should handle error without statusCode', () => {
    const err = {
      message: 'Generic error',
    };

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });

  it('should handle error without message', () => {
    const err = {};

    errorHandlerMiddleware(err, req, res);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({ err });
  });
});
