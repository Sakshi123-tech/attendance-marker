const socketIO = require('socket.io');

let io = null;

/**
 * Socket Manager - Centralized Web Socket Controller
 */
const socketManager = {
  /**
   * Initialize Socket.IO instance and attach to Server
   * @param {Object} server - Node.js HTTP Server instance
   */
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    console.log('[Socket] Socket.io server successfully initialized');

    // Monitor Socket Connections
    io.on('connection', (socket) => {
      console.log(`[Socket] New connection established: Client ID -> ${socket.id}`);

      // Handle custom user or kiosk subscription rooms
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`[Socket] Client ${socket.id} joined room: ${room}`);
      });

      // Handle Socket Disconnections
      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: Client ID -> ${socket.id}`);
      });
    });

    return io;
  },

  /**
   * Retrieve the active Socket.IO instance
   * @returns {Object} Active SocketIO instance
   */
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io has not been initialized yet. Call init(server) first!');
    }
    return io;
  },

  /**
   * Broadcast an event to all connected clients or specific rooms
   * @param {String} event - Event name/tag (e.g. 'attendance_marked')
   * @param {Object} data - Message payload
   * @param {String} [room] - Optional target room
   */
  emitEvent: (event, data, room = null) => {
    if (!io) {
      console.warn(`[Socket] Warning: Attempted to emit '${event}' but socket.io is not initialized`);
      return;
    }

    if (room) {
      io.to(room).emit(event, data);
      console.log(`[Socket] Emitted event '${event}' to room '${room}'`);
    } else {
      io.emit(event, data);
      console.log(`[Socket] Broadcasted event '${event}' globally to all clients`);
    }
  }
};

module.exports = socketManager;
