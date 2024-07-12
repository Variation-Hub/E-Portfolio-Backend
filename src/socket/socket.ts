import WebSocket from 'ws';

interface Client extends WebSocket {
    _userId?: string; // Optional property to store userId
}

interface UserClientMap {
    [userId: string]: Client[];
}

const userClientMap: UserClientMap = {};

function connection(client: Client): void {
    console.log("Client Connected");

    client.on('message', (message: string) => {
        const { userId } = JSON.parse(message);

        // Associate client with userId
        if (userClientMap[userId]) {
            userClientMap[userId].push(client);
        } else {
            userClientMap[userId] = [client];
        }

        console.log(`User ${userId} connected`, userClientMap);
    });

    client.on('close', () => {
        for (const userId in userClientMap) {
            userClientMap[userId] = userClientMap[userId].filter(c => c !== client);
            if (userClientMap[userId].length === 0) {
                delete userClientMap[userId];
            }
        }
        console.log('Client disconnected', userClientMap);
    });
}

export function initSocket(server): void {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', connection);
}

export function sendDataToUser(socketEvent: string, userIds: number[], data: any): void {
    userIds.forEach(userId => {
        userClientMap[userId]?.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.on(socketEvent, () => {
                    client.send(data)
                });
            }
        });
    });
}
