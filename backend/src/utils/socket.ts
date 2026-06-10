import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import Etudiant from '../models/Etudiant';

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    },
  });

  io.use(async (socket: Socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        require('fs').appendFileSync('socket_debug.log', 'Auth Error: No cookie header\n');
        return next(new Error('Authentication error'));
      }
      const cookies = cookie.parse(cookieHeader);
      const token = cookies.token;
      
      if (!token) {
        require('fs').appendFileSync('socket_debug.log', 'Auth Error: No token in cookie\n');
        return next(new Error('Authentication error'));
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      (socket as any).user = decoded;
      next();
    } catch (err: any) {
      const errMessage = `Auth Error: ${err.message}`;
      console.error(errMessage);
      require('fs').appendFileSync('socket_debug.log', errMessage + '\n');
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    const msg = `User connected: ${user.id} (${user.role}) - socket ${socket.id}`;
    console.log(msg);
    require('fs').appendFileSync('socket_debug.log', msg + '\n');

    // Join a room specifically for this user to receive direct notifications
    socket.join(`user_${user.id}`);

    // If the user is a student, fetch their department and join the department room
    if (user.role === 'etudiant') {
      try {
        const studentData = await Etudiant.findByPk(user.id);
        if (studentData && studentData.department) {
          socket.join(`dept_${studentData.department}`);
        }
      } catch (err) {
        console.error('Socket join department error:', err);
      }
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
