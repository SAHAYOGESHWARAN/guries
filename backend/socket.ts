
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, options: any) => {
    io = new Server(httpServer, options);
    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized! Ensure initSocket is called in server.ts');
    }
    return io;
};

