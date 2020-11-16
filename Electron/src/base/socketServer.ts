import * as WebSocket from 'ws';
const WebSocketServer = WebSocket.Server;
import * as Http from 'http';
import { CommandError, ErrorCode } from './commandError';
import { getApp } from './companionApp';
import * as uuid from 'uuid';
import { Encryption, DHParams } from './encryption'

export interface ICommandListener {
    onError(commandError: CommandError, response: any);
    onCommandResponse(response: any);
    onConnected();
}

export class ServerCallbacks {
    constructor(connected: () => void, closed: () => void, error: (e: CommandError, response: any) => void, command: (c: any) => void, listening: () => void) {
        this.onConnected = connected;
        this.onClosed = closed;
        this.onError = error;
        this.onCommandResponse = command;
        this.onListening = listening;
    }

    onConnected: () => void;
    onClosed: () => void;
    onError: (error: CommandError, response: any) => void;
    onListening: () => void;
    // Callbacks for messages interpreted as commands and events respectively
    onCommandResponse: (response: any) => void;
    eventCallbacks: any = {};
}

export class SocketServer {
    readonly encryptionSubprotocol: string = "com.microsoft.minecraft.wsencrypt";

    connectedClient: WebSocket;
    server: Http.Server;
    wsServer: WebSocket.Server;
    callbacks: ServerCallbacks;
    // Nice for breakpoint debugging
    lastSent: any = null;
    encryption: Encryption = new Encryption();
    rawListenerCallback: (message: string)=>void = null;
    closingConnection: boolean = false;

    constructor(port: number, callbacks: ServerCallbacks) {
        let socketServer: SocketServer = this;
        this.callbacks = callbacks;
        this.server = Http.createServer((request: Http.IncomingMessage, response: Http.ServerResponse) => {
            // Process HTTP request. Since we're writing just a WebSockets server we don't have to implement anything.
        });

        this.server.on('error', (e) => {
            let ce: CommandError = new CommandError(ErrorCode.FailedToBind);
            ce.errorMessage += String(port);
            socketServer.callbacks.onError(ce, {});
        });

        this.server.listen(port, (e) => {
            this.callbacks.onListening();
            // Need to wait to make sure we listened succesfully because otherwise ws will throw
            // If we didn't manage to listen we'll get the error message above
            this.createWSServer();
            getApp().debugLog(`WS server listening at ${this.getIPAddress()}:${port}`);
        });
    }

    createWSServer() {
        let socketServer: SocketServer = this;
        this.wsServer = new WebSocket.Server({
            server: this.server,
            handleProtocols: (protocols: string[], shouldAccept: (boolean, string)=>void) => {
                let foundProtocol: string = protocols.find((curVal: string) => {
                    return curVal == socketServer.encryptionSubprotocol || curVal == '';
                });
                // If no protocol is provided, protocols is {''}, so accept that too
                let accept: boolean = foundProtocol != null;
                // If they didn't ask for a protocol, we don't want to return one, so null for ''
                let protocol: string = foundProtocol == '' ? undefined : foundProtocol;
                getApp().debugLog(`Accepted protocol? ${accept}`);
                shouldAccept(accept, protocol);
            }
        });

        // There are some rare errors that come out of nowhere and don't stop us from being able to continue, so just catch them and carry on
        this.wsServer.on('error', (err: Error) => {
            getApp().debugLog(`WebSocket Server error: ${err.message}`);
        });

        this.wsServer.on('connection', (client: WebSocket) => {
            // Need to register this first thing otherwise any error will be an uncaught exception
            client.on('error', (err: Error) => {
                getApp().debugLog(err.message);
                let cm: CommandError = new CommandError(ErrorCode.FailedToSendCommand);
                cm.errorMessage += `\n${err.message}`;
                socketServer.callbacks.onError(cm, null);
            });

            // Drop old connection in favor of this one
            if (socketServer.hasConnection()) {
                // Refuse new one. Since it never connected, Minecraft won't try to reconnect constantly.
                getApp().debugLog('Already have connection, refusing new one');
                client.close();
                return;
            }
            this.closingConnection = false;
            this.connectedClient = client;
            getApp().debugLog(`Connected! ${this.getConnectedIP()}`);
            socketServer.callbacks.onConnected();

            this.connectedClient.on('close', (code: number, message: string) => {
                socketServer.callbacks.onClosed();
                socketServer.connectedClient = null;
                socketServer.encryption.disable();
                getApp().debugLog('Connection closed');
            });

            this.connectedClient.on('message', (data: any, flags: any) => {
                let message = data;
                if (this.encryption.enabled()) {
                    message = this.encryption.decrypt(data);
                }

                getApp().debugLog(message);

                if (this.rawListenerCallback != null) {
                    this.rawListenerCallback(message);
                }

                let response: any = null;
                try {
                    response = JSON.parse(message);
                }
                catch (e) {
                    // Should never happen
                    getApp().debugLog('Failed to parse JSON from Minecraft, could be an encryption error');
                    socketServer.callbacks.onError(new CommandError(ErrorCode.FailedToParseCommandResponse), message);
                    socketServer.closeConnection();
                    return;
                }

                try {
                    let purpose: string = response.header.messagePurpose;
                    switch (purpose) {
                        case 'event': {
                            let callback = socketServer.callbacks.eventCallbacks[response.body.eventName];
                            if (callback != null) {
                                callback(response); break;
                            }
                            else {
                                // Can happen if a previous websocket connection didn't unsubscribe 
                                if (this.rawListenerCallback == null) {
                                    getApp().debugLog(`Received event this wasn't subscribed to: ${response.body.eventName}`);
                                }
                            }
                            break;
                        }
                        case 'commandResponse': {
                            // From minecraft's status code:
                            // Creates an MCRESULT. Similar to HRESULT, the first bit indicates success (0) or
                            // failure (1). The next 15 are a category code, indicating the system the error
                            // originated from. The remaining 16 bits are used to store a unique result code.
                            let statusCode: number = response.body.statusCode;
                            if ((statusCode & (1 << 31)) == 0) {
                                socketServer.callbacks.onCommandResponse(response);
                                break;
                            }
                            // else intentional fall through to error case
                        }
                        case 'error': {
                            if (socketServer.closingConnection) {
                                getApp().debugLog('Error with close request, forcing close');
                                socketServer.connectedClient.close();
                            }
                            else {
                                let cm: CommandError = new CommandError(ErrorCode.FailedCommandExecution);
                                cm.errorMessage += `\n${response.body.statusMessage}`;
                                getApp().debugLog(cm.errorMessage);
                                socketServer.callbacks.onError(cm, response);
                            }
                            break;
                        }
                        default: {
                            getApp().debugLog('Unknown message purpose');
                            socketServer.callbacks.onError(new CommandError(ErrorCode.FailedToParseCommandResponse), response);
                            break;
                        }
                    }
                }
                catch (e) {
                    getApp().debugLog(`Malformed response:\n${data.utf8Data}`);
                    socketServer.callbacks.onError(new CommandError(ErrorCode.FailedToParseCommandResponse), response);
                }
            });
        });
    }

    // This will disable all processing except encryption/decryption and forward all messages to this callback
    setRawListener(callback: (message: string)=>void) {
        this.rawListenerCallback = callback;
    }

    hasConnection(): boolean {
        return !this.closingConnection && this.connectedClient != null && (this.connectedClient.readyState == WebSocket.OPEN || this.connectedClient.readyState == WebSocket.CONNECTING);
    }

    getConnectedIP(): string {
        if (this.connectedClient != null) {
            let remoteAddress = this.connectedClient.upgradeReq.connection.remoteAddress;		
            // Strip ::fff stuff off the front
            remoteAddress = remoteAddress.replace(/^.*:/, '');
            return remoteAddress;
        }
        return null;
    }

    getIPAddress(): string {
        const interfaces = require('os').networkInterfaces();
        for (let devName in interfaces) {
            let iface = interfaces[devName];

            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return '0.0.0.0';
    }

    isConnected(): boolean {
        return this.connectedClient != null;
    }

    createCommand(commandLine: string, version: number = 1): any {
        return {
            "header": {
                "requestId": uuid.v4(),
                "messagePurpose": "commandRequest",
                "version": 1,
                "messageType": "commandRequest"
            },
            "body": {
                "origin": {
                    "type": "player"
                },
                "commandLine": commandLine,
                "version": version
            }
        };
    }

    sendCommand(commandLine: string, version: number = 1): string {
        let command = this.createCommand(commandLine, version);
        this.send(command);
        // At the moment we only plan on supporting one command at a time, but
        // this could be stored and used to match multiple requests to responses on a wrappwer class if the need arose
        return command.header.requestId;
    }

    sendText(text: string) {
        if (this.hasConnection()) {
            let message = text;
            if (this.encryption.enabled()) {
                this.connectedClient.send(this.encryption.encrypt(message), { binary: true});
            }
            else {
                this.connectedClient.send(message);
            }
        }
        else {
            getApp().debugLog("Couldn't send, no connected client");
            if (this.rawListenerCallback != null) {
                this.rawListenerCallback('{"error":"Not connected"}');
            }
        }
    }

    send(command: any) {
        this.lastSent = command;
        this.sendText(JSON.stringify(command));
    }

    subscribeToEvent(eventName: string, callback: (event: any) => void) {
        this.callbacks.eventCallbacks[eventName] = callback;
        let subscribeBody = {
            "header": {
                "requestId": uuid.v4(),
                "messagePurpose": "subscribe",
                "version": 1,
                "messageType": "commandRequest"
            },
            "body": {
                "eventName": eventName
            }
        };
        this.send(subscribeBody);
    }

    closeConnection() {
        this.sendCommand("closewebsocket");
        this.closingConnection = true;
    }

    beginKeyExchange(): DHParams {
        return this.encryption.beginDHExchange();
    }

    completeKeyExchange(publicKey: string): boolean {
        return this.encryption.completeDHExchange(publicKey);
    }
}