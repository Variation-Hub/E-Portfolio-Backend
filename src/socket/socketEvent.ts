import { getIo } from './socket';

interface UserSocketMap {
    [userId: string]: string;
}

const userSocketMap: UserSocketMap = {};

export function connectUser(userId: string): void {
    const io = getIo();
    console.log('Connecting')
    io.on('connection', (socket) => {
        console.log(userId + ' connected')
        console.log('A user connected', socket.id, userId);

        if (!userSocketMap[userId]) {
            userSocketMap[userId] = socket.id;
        }

        socket.on('disconnect', () => {
            console.log('User disconnected');
            delete userSocketMap[userId];
        });
    });
    io.emit('connect_user', userId);
}

export function sendMessageToUser(userId: string, data: { title: string, message: string }): void {
    const io = getIo();
    if (userSocketMap[userId]) {
        io.to(userSocketMap[userId]).emit('message', data);
    } else {
        console.error('User not connected');
    }
}
