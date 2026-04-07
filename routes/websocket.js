const express = require('express');
const router = express.Router();

// GET /api/v1/ws - Get WebSocket connection information
router.get('/', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');

  res.json({
    message: 'WebSocket endpoint for database change subscriptions',
    websocket: {
      url: `ws://${host}`,
      protocol: 'WebSocket',
      supportedCollections: ['users', 'jobs'],
      messageTypes: {
        subscribe: 'Subscribe to collection changes',
        unsubscribe: 'Unsubscribe from collection changes',
        ping: 'Keep connection alive',
        change: 'Database change notification (server-sent)',
        connection: 'Connection established (server-sent)',
        error: 'Error message (server-sent)',
        subscribed: 'Subscription confirmed (server-sent)',
        unsubscribed: 'Unsubscription confirmed (server-sent)',
        pong: 'Ping response (server-sent)'
      },
      exampleMessages: {
        subscribe: { type: 'subscribe', collection: 'jobs' },
        unsubscribe: { type: 'unsubscribe', collection: 'jobs' },
        ping: { type: 'ping' }
      }
    },
    documentation: {
      description: 'Real-time database change notifications via WebSocket',
      features: [
        'Subscribe to specific collection changes',
        'Receive real-time notifications for inserts, updates, deletes',
        'Automatic reconnection handling',
        'Collection-specific subscriptions'
      ],
      collections: {
        users: 'User account changes (registration, profile updates)',
        jobs: 'Job posting changes (creation, updates, deletion)'
      }
    }
  });
});

module.exports = router;