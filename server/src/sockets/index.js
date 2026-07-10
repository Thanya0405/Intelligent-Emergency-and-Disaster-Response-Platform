const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSockets = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        socket.user = null;
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-passwordHash');
      next();
    } catch (e) {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString() || 'anonymous';
    console.log(`🔌 Socket connected: ${userId}`);

    // Join user-specific room
    if (socket.user) {
      socket.join(`user:${userId}`);
      socket.join('authenticated');
    }

    // Admin joins admin room
    if (socket.user?.role === 'admin') {
      socket.join('admin');
    }

    // Location update from client
    socket.on('location:update', async (data) => {
      if (socket.user) {
        io.to('admin').emit('location:user', {
          userId: socket.user._id,
          name: socket.user.name,
          ...data
        });
      }
    });

    // Emergency SOS
    socket.on('emergency:sos', (data) => {
      io.to('admin').emit('emergency:sos', {
        userId: socket.user?._id,
        name: socket.user?.name,
        ...data,
        timestamp: new Date()
      });
    });

    // Family status ping
    socket.on('family:ping', (data) => {
      io.to(`user:${data.targetUserId}`).emit('family:pong', {
        fromId: socket.user?._id,
        status: data.status,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
    });
  });

  return io;
};

module.exports = initSockets;
