const notFound = require('./not-found');

describe('Not Found Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      url: '/nonexistent-route',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should send 404 status with message', () => {
    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Route does not exist');
  });

  it('should log the request URL', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    notFound(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Request url =>',
      '/nonexistent-route'
    );

    consoleSpy.mockRestore();
  });
});
