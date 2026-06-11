"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie = __importStar(require("cookie"));
const Etudiant_1 = __importDefault(require("../models/Etudiant"));
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
            credentials: true,
        },
    });
    io.use(async (socket, next) => {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch (err) {
            const errMessage = `Auth Error: ${err.message}`;
            console.error(errMessage);
            require('fs').appendFileSync('socket_debug.log', errMessage + '\n');
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', async (socket) => {
        const user = socket.user;
        const msg = `User connected: ${user.id} (${user.role}) - socket ${socket.id}`;
        console.log(msg);
        require('fs').appendFileSync('socket_debug.log', msg + '\n');
        // Join a room specifically for this user to receive direct notifications
        socket.join(`user_${user.id}`);
        // If the user is a student, fetch their department and join the department room
        if (user.role === 'etudiant') {
            try {
                const studentData = await Etudiant_1.default.findByPk(user.id);
                if (studentData && studentData.department) {
                    socket.join(`dept_${studentData.department}`);
                }
            }
            catch (err) {
                console.error('Socket join department error:', err);
            }
        }
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized');
    }
    return io;
};
exports.getIO = getIO;
