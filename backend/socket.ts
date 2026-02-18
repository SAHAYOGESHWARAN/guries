
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;
const userSockets = new Map<number, string[]>(); // Map of userId -> socketIds

export const initSocket = (httpServer: HttpServer, options: any) => {
    io = new Server(httpServer, options);

    // Handle user connections
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // When user joins, store their socket ID
        socket.on('user_join', (userId: number) => {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, []);
            }
            const sockets = userSockets.get(userId)!;
            if (!sockets.includes(socket.id)) {
                sockets.push(socket.id);
            }
            socket.join(`user_${userId}`);
            console.log(`[Socket] User ${userId} joined room user_${userId}`);
        });

        // Handle room joins
        socket.on('join_room', (room: string) => {
            socket.join(room);
            console.log(`[Socket] Client ${socket.id} joined room: ${room}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
            // Remove socket from all user mappings
            for (const [userId, sockets] of userSockets.entries()) {
                const index = sockets.indexOf(socket.id);
                if (index > -1) {
                    sockets.splice(index, 1);
                    if (sockets.length === 0) {
                        userSockets.delete(userId);
                    }
                }
            }
        });
    });

    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized! Ensure initSocket is called in server.ts');
    }
    return io;
};

/**
 * Emit notification to specific user
 */
export const emitToUser = (userId: number, event: string, data: any) => {
    if (!io) return;
    io.to(`user_${userId}`).emit(event, data);
    console.log(`[Socket] Emitted ${event} to user ${userId}`);
};

/**
 * Emit notification to all users
 */
export const emitToAll = (event: string, data: any) => {
    if (!io) return;
    io.emit(event, data);
    console.log(`[Socket] Emitted ${event} to all users`);
};

/**
 * Emit notification to room
 */
export const emitToRoom = (room: string, event: string, data: any) => {
    if (!io) return;
    io.to(room).emit(event, data);
    console.log(`[Socket] Emitted ${event} to room ${room}`);
};
