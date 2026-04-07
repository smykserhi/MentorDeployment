const WebSocket = require('ws');
const http = require('http');
const WebSocketService = require('./websocket');

describe('WebSocket Service', () => {
  let httpServer;
  let wsService;
  let testClient;

  beforeAll((done) => {
    // Create a test HTTP server
    httpServer = http.createServer();
    httpServer.listen(0, () => { // Use port 0 for automatic port assignment
      const port = httpServer.address().port;
      console.log(`Test HTTP server started on port ${port}`);

      // Initialize WebSocket service with the test server
      wsService = new WebSocketService(httpServer);
      done();
    });
  });

  afterAll((done) => {
    if (wsService) {
      wsService.close();
    }
    if (httpServer) {
      httpServer.close(() => {
        console.log('Test HTTP server closed');
        done();
      });
    } else {
      done();
    }
  });

  beforeEach((done) => {
    const port = httpServer.address().port;
    testClient = new WebSocket(`ws://localhost:${port}`);

    testClient.on('open', () => {
      done();
    });

    testClient.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      done(error);
    });
  });

  afterEach((done) => {
    if (testClient && testClient.readyState === WebSocket.OPEN) {
      testClient.close();
    }
    done();
  });

  describe('WebSocket Connection', () => {
    test('should establish connection and receive welcome message', (done) => {
      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('connection');
        expect(message.message).toBe('Connected to database change stream');
        expect(message.timestamp).toBeDefined();
        done();
      });
    }, 10000);

    test('should handle ping-pong messages', (done) => {
      let receivedPong = false;

      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'pong') {
          expect(message.timestamp).toBeDefined();
          receivedPong = true;
          done();
        }
      });

      // Send ping after a short delay to ensure connection is ready
      setTimeout(() => {
        testClient.send(JSON.stringify({ type: 'ping' }));
      }, 100);
    }, 10000);

    test('should handle subscription messages', (done) => {
      let receivedSubscribed = false;

      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribed') {
          expect(message.collection).toBe('jobs');
          expect(message.message).toBe('Subscribed to jobs changes');
          expect(message.timestamp).toBeDefined();
          receivedSubscribed = true;
          done();
        }
      });

      // Send subscribe after a short delay
      setTimeout(() => {
        testClient.send(JSON.stringify({ type: 'subscribe', collection: 'jobs' }));
      }, 100);
    }, 10000);

    test('should handle unsubscription messages', (done) => {
      let receivedUnsubscribed = false;

      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'unsubscribed') {
          expect(message.collection).toBe('Unsubscribed from jobs changes');
          expect(message.timestamp).toBeDefined();
          receivedUnsubscribed = true;
          done();
        }
      });

      // Send unsubscribe after a short delay
      setTimeout(() => {
        testClient.send(JSON.stringify({ type: 'unsubscribe', collection: 'jobs' }));
      }, 100);
    }, 10000);

    test('should handle invalid message types', (done) => {
      let receivedError = false;

      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toBe('Unknown message type');
          expect(message.timestamp).toBeDefined();
          receivedError = true;
          done();
        }
      });

      // Send invalid message after a short delay
      setTimeout(() => {
        testClient.send(JSON.stringify({ type: 'invalid' }));
      }, 100);
    }, 10000);

    test('should handle malformed JSON', (done) => {
      let receivedError = false;

      testClient.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error') {
          expect(message.message).toBe('Invalid message format');
          expect(message.timestamp).toBeDefined();
          receivedError = true;
          done();
        }
      });

      // Send malformed JSON after a short delay
      setTimeout(() => {
        testClient.send('invalid json');
      }, 100);
    }, 10000);
  });
});