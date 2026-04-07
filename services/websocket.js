const WebSocket = require('ws');
const mongoose = require('mongoose');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.changeStreams = new Map();

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to database change stream',
        timestamp: new Date().toISOString()
      }));

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Initialize change streams
    this.initializeChangeStreams();
  }

  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(ws, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(ws, data);
        break;
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type',
          timestamp: new Date().toISOString()
        }));
    }
  }

  handleSubscription(ws, data) {
    const { collection } = data;
    if (!collection) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Collection name is required for subscription',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Store subscription info for this client
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    ws.subscriptions.add(collection);

    ws.send(JSON.stringify({
      type: 'subscribed',
      collection,
      message: `Subscribed to ${collection} changes`,
      timestamp: new Date().toISOString()
    }));

    console.log(`Client subscribed to ${collection} changes`);
  }

  handleUnsubscription(ws, data) {
    const { collection } = data;
    if (!collection) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Collection name is required for unsubscription',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (ws.subscriptions) {
      ws.subscriptions.delete(collection);
    }

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      collection,
      message: `Unsubscribed from ${collection} changes`,
      timestamp: new Date().toISOString()
    }));

    console.log(`Client unsubscribed from ${collection} changes`);
  }

  initializeChangeStreams() {
    // Initialize change streams for User and Job collections
    this.setupChangeStream('users', 'User');
    this.setupChangeStream('jobs', 'Job');
  }

  setupChangeStream(collectionName, modelName) {
    try {
      const Model = mongoose.model(modelName);
      const changeStream = Model.watch();

      changeStream.on('change', (change) => {
        console.log(`Change detected in ${collectionName}:`, change.operationType);

        // Broadcast to all connected clients subscribed to this collection
        this.broadcastChange(collectionName, change);
      });

      changeStream.on('error', (error) => {
        console.error(`Change stream error for ${collectionName}:`, error);
      });

      this.changeStreams.set(collectionName, changeStream);
      console.log(`Change stream initialized for ${collectionName}`);
    } catch (error) {
      console.error(`Failed to setup change stream for ${collectionName}:`, error);
    }
  }

  broadcastChange(collectionName, change) {
    const message = {
      type: 'change',
      collection: collectionName,
      operationType: change.operationType,
      documentKey: change.documentKey,
      data: change.fullDocument || change.updateDescription || change,
      timestamp: new Date().toISOString()
    };

    let broadcastCount = 0;
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        // Check if client is subscribed to this collection
        if (!client.subscriptions || client.subscriptions.has(collectionName)) {
          try {
            client.send(JSON.stringify(message));
            broadcastCount++;
          } catch (error) {
            console.error('Error sending message to client:', error);
            this.clients.delete(client);
          }
        }
      } else {
        // Remove dead connections
        this.clients.delete(client);
      }
    });

    console.log(`Broadcasted ${collectionName} change to ${broadcastCount} clients`);
  }

  // Method to broadcast custom messages
  broadcast(message) {
    const data = JSON.stringify({
      type: 'broadcast',
      ...message,
      timestamp: new Date().toISOString()
    });

    let broadcastCount = 0;
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
          broadcastCount++;
        } catch (error) {
          console.error('Error broadcasting message:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });

    console.log(`Broadcasted custom message to ${broadcastCount} clients`);
  }

  // Cleanup method
  close() {
    // Close all change streams
    this.changeStreams.forEach((stream, collectionName) => {
      stream.close();
      console.log(`Closed change stream for ${collectionName}`);
    });

    // Close all WebSocket connections
    this.clients.forEach(client => {
      client.close();
    });

    // Close WebSocket server
    this.wss.close();
    console.log('WebSocket service closed');
  }
}

module.exports = WebSocketService;