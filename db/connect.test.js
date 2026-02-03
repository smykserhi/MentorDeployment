const mongoose = require('mongoose');
const connectDB = require('./connect');

jest.mock('mongoose');

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to MongoDB with provided URL', async () => {
    const testUrl = 'mongodb://localhost:27017/testdb';
    const mockConnection = { readyState: 1 };

    mongoose.connect.mockResolvedValue(mockConnection);

    const result = await connectDB(testUrl);

    expect(mongoose.connect).toHaveBeenCalledWith(testUrl);
    expect(result).toBe(mockConnection);
  });

  it('should handle connection errors', async () => {
    const testUrl = 'mongodb://localhost:27017/testdb';
    const error = new Error('Connection failed');

    mongoose.connect.mockRejectedValue(error);

    await expect(connectDB(testUrl)).rejects.toThrow('Connection failed');
  });
});
