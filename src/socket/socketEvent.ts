import { SocketEvents } from '../util/constants';
import { getIo } from './socket';

interface UserSocketMap {
    [userId: string]: string[];
}

const userSocketMap: UserSocketMap = {};
export function connectUser(userId: string): void {
    const io = getIo();
    console.log('Connecting')
    io.on('connection', (socket) => {
        console.log(userId + ' connected')
        console.log('A user connected', socket.id, userId);

        userSocketMap[userId] = [...(userSocketMap[userId] ?? []), ...(userSocketMap[userId] && userSocketMap[userId].includes(socket.id) ? [] : [socket.id])];

        socket.on('disconnect', () => {
            console.log('socket disconnected')
            userSocketMap[userId].reduce((acc, curr) => curr !== socket.id ? acc.concat(curr) : acc, [])
            console.log('socket disconnected', userSocketMap)
        });
        console.log(userSocketMap, 'userSocketMap')
    });
    io.emit('connect_user', userId);
}

export function sendMessageToUser(userId: string, data: { title: string, message: string, domain: string }): void {
    const io = getIo();
    if (userSocketMap[userId]) {
        io.to(userSocketMap[userId]).emit(SocketEvents.Notification, data);
    } else {
        console.error('User not connected');
    }
}

export function sendDataTOUser(socketEvent: string, userIds: number[], data: any): void {
    const io = getIo();
    userIds.forEach(userId => {
        if (userSocketMap[userId]) {
            io.to(userSocketMap[userId]).emit(socketEvent, data);
        } else {
            console.error('User not connected');
        }
    })
}