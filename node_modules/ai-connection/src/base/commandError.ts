import { getApp } from './companionApp';

export enum ErrorCode {
    RestParseFail,
    TargetParseFail,
    NoConnection,
    FailedToSendCommand,
    FailedToParseCommandResponse,
    FailedCommandExecution,
    CancelledCommand,
    InvalidURL,
    FailedToBind,
    VersionMismatch
}

export class CommandError {
    errorCode: number;
    errorMessage: string;

    constructor(code: ErrorCode) {
        this.errorCode = code;
        switch(code) {
            case ErrorCode.RestParseFail: this.errorMessage = 'Malformed REST query'; break;
            case ErrorCode.TargetParseFail: this.errorMessage = 'Failed to parse input target selector'; break;
            case ErrorCode.NoConnection: this.errorMessage = 'No Websocket connection'; break;
            case ErrorCode.FailedToSendCommand: this.errorMessage = 'Websocket error trying to send command'; break;
            case ErrorCode.FailedToParseCommandResponse: this.errorMessage = 'Failed to parse websocket response for command'; break;
            case ErrorCode.FailedCommandExecution: this.errorMessage = 'Minecraft side command execution failed'; break;
            case ErrorCode.CancelledCommand: this.errorMessage = 'Cancelled execution of command in favor of new one'; break;
            case ErrorCode.InvalidURL: this.errorMessage = 'Invalid url: '; break;
            // Errors that will be exposed to the user need to be localized
            case ErrorCode.FailedToBind: this.errorMessage = getApp().localize('error.failedtobind'); break;
            default: console.assert(false, 'Unhandled error code');
        }
    }
}

export enum ConnectionError {
    None,
    GetInfoError,
    ThisOutOfDate,
    MinecraftOutOfDate,
    CreateAgentError
}