// Load environment variables immediately on startup
require('dotenv').config();

// Handle Uncaught Exceptions (e.g. referencing an undefined variable)
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception detected! Shutting down server...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socketManager = require('./sockets/socketManager');
const bootstrapSuperAdmin = require('./utils/bootstrap');
const { initScheduler } = require('./cron/scheduler');
const { initCronJobs } = require('./cron/attendanceScheduler');

/**
 * Bootstraps the entire backend server application
 */
const startServer = async () => {
  // 1. Establish Database Connection
  await connectDB();

  // 2. Run Super Admin provisioning bootstrap logic
  await bootstrapSuperAdmin();

  // 3. Create HTTP Server wrapping the Express app instance
  const server = http.createServer(app);

  // 4. Initialize Socket.IO and bind to the HTTP Server
  socketManager.init(server);

  // 5. Initialize background cron/interval schedulers
  initScheduler();
  initCronJobs();

  // 6. Launch listener on designated port
  const PORT = process.env.PORT || 5000;
  const runningServer = server.listen(PORT, () => {
    console.log(`[Server] Application running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
  });

  // Handle Unhandled Promise Rejections (e.g. failed async db operations without try/catch)
  process.on('unhandledRejection', (err) => {
    console.error('[CRITICAL] Unhandled Promise Rejection detected! Initiating graceful shutdown...');
    console.error(err.name, err.message);
    
    runningServer.close(() => {
      console.log('[Server] HTTP connections terminated.');
      process.exit(1);
    });
  });
};

startServer();
