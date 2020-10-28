import { SocketServer, ICommandListener } from './base/socketServer';
import { getApp } from './base/companionApp';
import * as Error from './base/commandError';
import { ConnectionError, ErrorCode } from './base/commandError';
import { DHParams } from './base/encryption';

let requiredCompanionProtocol: number = 4;

enum ConnectionStage {
    NotConnected,
    CheckingVersion,
    EnablingEncryption,
    CreatingAgent,
    Complete
}

// NOTE: only escapes a " if it's not already escaped
function escapeDoubleQuotes(str) {
	return str.replace(/\\([\s\S])|(")/g,"\\$1$2");
}

export class ConnectionInitializer implements ICommandListener {
    curCommandId: string;
    connectionStage: ConnectionStage = ConnectionStage.NotConnected;

    sendCommand(commandLine: string) {
        this.curCommandId = getApp().server.sendCommand(commandLine);
    }

    onConnected() {
        this.connectionStage = ConnectionStage.CheckingVersion;
        this.sendCommand('geteduclientinfo');
        getApp().debugLog('Client connected to AI Connection');
    }

    callback(error: ConnectionError) {
        getApp().onConnectionComplete.call(getApp(), error);
    }

    verifyGetClientInfo(command: any): ConnectionError {
        let body = command.body;
        if (body == null) {
            getApp().debugLog('Error getting client info');
            return ConnectionError.GetInfoError;
        }
        let cVersion: number = body.companionProtocolVersion;
        if (cVersion < requiredCompanionProtocol) {
            getApp().debugLog('Connected Minecraft is out of date');
            getApp().telemetry.fireConnectionFailureEvent(cVersion, requiredCompanionProtocol, ErrorCode.VersionMismatch, ConnectionError.MinecraftOutOfDate);
            return ConnectionError.MinecraftOutOfDate;
        }
        if (cVersion > requiredCompanionProtocol) {
            getApp().debugLog('AI Connection is out of date');
            getApp().telemetry.fireConnectionFailureEvent(cVersion, requiredCompanionProtocol, ErrorCode.VersionMismatch, ConnectionError.ThisOutOfDate);
            return ConnectionError.ThisOutOfDate;
        }
        getApp().telemetry.clientId = body.clientuuid;
        getApp().telemetry.playerSessionid = body.playersessionuuid;
        getApp().telemetry.userId = body.userId;
        getApp().setIsEdu(body.isEdu);

        return ConnectionError.None;
    }

    onCommandResponse(response: any) {
        if (response.header.requestId != this.curCommandId) {
            getApp().debugLog('Returned command id did not match verification request id');
            return;
        }

        switch (this.connectionStage) {
            case ConnectionStage.CheckingVersion: {
                let verificationError: ConnectionError = this.verifyGetClientInfo(response);
                if (verificationError != ConnectionError.None) {
                    this.callback(verificationError);
                    return;
                }
                getApp().debugLog('Client is in education mode');

                this.connectionStage = ConnectionStage.EnablingEncryption;
                let params: DHParams = getApp().server.beginKeyExchange();
                this.sendCommand('enableencryption "' + escapeDoubleQuotes(params.publicKey) + '" "' + escapeDoubleQuotes(params.salt) + '"');
                break;
            }

            case ConnectionStage.EnablingEncryption: {
                if (response.body.publicKey == null || getApp().server.completeKeyExchange(response.body.publicKey) == false) {
                    this.callback(ConnectionError.GetInfoError);
                    return;
                }
                getApp().debugLog('Encryption enabled');

                this.connectionStage = ConnectionStage.CreatingAgent;
                this.sendCommand('agent create');
                break;
            }

            case ConnectionStage.CreatingAgent: {
                getApp().debugLog('Agent created');
                this.connectionStage = ConnectionStage.Complete;
                this.callback(ConnectionError.None);
                break;
            }

            default: {
                getApp().debugLog('Unexpected connection stage in command response');
                break;
            }
        }
    }

    onError(error: Error.CommandError) {
        // Close web socket connection if error occurs
        getApp().server.closeConnection();
        getApp().debugLog('Connection initialization error, aborting connection');
        let status: ConnectionError;
        // Single out agent creation in case we decide to make this command unsupported under some condition or platform
        if (this.connectionStage == ConnectionStage.CreatingAgent) {
            status = ConnectionError.CreateAgentError;
        }
        // Lump in any encryption or get info errors into getinfoerror
        else {
            status = ConnectionError.GetInfoError;
        }
        getApp().telemetry.fireConnectionFailureEvent(0, requiredCompanionProtocol, error.errorCode, status);
        this.callback(status);
    }
}