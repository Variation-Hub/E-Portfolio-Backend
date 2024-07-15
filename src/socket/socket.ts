import WebSocket from 'ws';
import url from 'url';

interface Client extends WebSocket {
    _userId?: string;
}

const userClientMap: any = new Map();

function getClientIdFromUrl(requestUrl) {
    const parsedUrl = url.parse(requestUrl, true);
    return parsedUrl.query && parsedUrl.query.id ? parsedUrl.query.id : null;
}


function removeClientFromMap(clientId: string, client: WebSocket): void {
    const clients = userClientMap.get(clientId);
    if (clients) {
        const updatedClients = clients.filter(c => c !== client);
        if (updatedClients.length > 0) {
            userClientMap.set(clientId, updatedClients);
        } else {
            userClientMap.delete(clientId);
        }
    }
}

function connection(client: Client, req): void {
    console.log("Client Connected");

    const clientId: any = getClientIdFromUrl(req.url);
    if (!clientId) {
        client.close();
        return;
    }
    if (userClientMap.get(clientId)) {
        userClientMap.set(clientId, [...userClientMap.get(clientId), client]);
    } else {
        userClientMap.set(clientId, [client]);
    }
    console.log(userClientMap, userClientMap.get(clientId)?.length, clientId,)

    client.on('close', () => {
        removeClientFromMap(clientId, client);
        console.log('Client disconnected');
    });
}

export function initSocket(server): void {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', connection);
}

export function sendDataToUser(userIds: number[], data: any): void {
    userIds.forEach(userId => {
        if (userId) {
            console.log(userClientMap, userId, userClientMap.get(userId.toString()), "{}{}{}{}{}{}")
            userClientMap.get(userId.toString())?.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    // console.log(client.readyState === WebSocket.OPEN, WebSocket.OPEN, client, "+++++++++++++++++++++++++++++++++++")
                    client.send(JSON.stringify(data))
                }
            });
        }
    });
}
