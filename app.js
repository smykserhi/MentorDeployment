require('dotenv').config();
require('express-async-errors');
const express = require('express');
const http = require('http');

// Extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const server = http.createServer(app);
const connectDB = require('./db/connect');
const WebSocketService = require('./services/websocket');

// routes imports
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
const websocketRouter = require('./routes/websocket');
const imagesRouter = require('./routes/images');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authMidlaware = require('./middleware/authentication');

// app.use("trust proxy", 1);
// Limit requests from same IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet()); // set security headers
app.use(cors()); // enable CORS
app.use(xss()); // sanitize user input for preventing XSS attacks

// extra packages

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authMidlaware, jobsRouter);
app.use('/api/v1/images', authMidlaware, imagesRouter);
app.use('/api/v1/ws', websocketRouter);

//dummy route for testing
app.get('/', (req, res) => {
  res.send('<h1>Hello world!</h1><a href="/api-docs">API Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// error handler middlewares

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

let websocketService;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });

    // Initialize WebSocket service
    websocketService = new WebSocketService(server);
    console.log('WebSocket service initialized for database change subscriptions');

  } catch (error) {
    if (error.code === 'ENOTFOUND' && String(error.hostname || '').includes('mongodb.net')) {
      console.error(
        `MongoDB host could not be resolved (${error.hostname}). Check MONGO_URI in .env and copy a fresh connection string from Atlas.`
      );
    } else {
      console.error('Failed to start application:', error.message);
    }
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (websocketService) {
    websocketService.close();
  }
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (websocketService) {
    websocketService.close();
  }
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = { app, start, server, websocketService };
