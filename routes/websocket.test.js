const request = require('supertest');
const { app } = require('../app');

describe('WebSocket Routes', () => {
  describe('GET /api/v1/ws', () => {
    test('should return WebSocket connection information', async () => {
      const response = await request(app)
        .get('/api/v1/ws')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('websocket');
      expect(response.body).toHaveProperty('documentation');

      // Check websocket object structure
      expect(response.body.websocket).toHaveProperty('url');
      expect(response.body.websocket).toHaveProperty('protocol', 'WebSocket');
      expect(response.body.websocket).toHaveProperty('supportedCollections');
      expect(response.body.websocket.supportedCollections).toEqual(
        expect.arrayContaining(['users', 'jobs'])
      );
      expect(response.body.websocket).toHaveProperty('messageTypes');
      expect(response.body.websocket).toHaveProperty('exampleMessages');

      // Check message types
      const messageTypes = response.body.websocket.messageTypes;
      expect(messageTypes).toHaveProperty('subscribe');
      expect(messageTypes).toHaveProperty('unsubscribe');
      expect(messageTypes).toHaveProperty('ping');
      expect(messageTypes).toHaveProperty('change');
      expect(messageTypes).toHaveProperty('connection');
      expect(messageTypes).toHaveProperty('error');

      // Check example messages
      const examples = response.body.websocket.exampleMessages;
      expect(examples.subscribe).toEqual({ type: 'subscribe', collection: 'jobs' });
      expect(examples.unsubscribe).toEqual({ type: 'unsubscribe', collection: 'jobs' });
      expect(examples.ping).toEqual({ type: 'ping' });

      // Check documentation
      expect(response.body.documentation).toHaveProperty('description');
      expect(response.body.documentation).toHaveProperty('features');
      expect(response.body.documentation).toHaveProperty('collections');
      expect(response.body.documentation.collections).toHaveProperty('users');
      expect(response.body.documentation.collections).toHaveProperty('jobs');
    });
  });
});