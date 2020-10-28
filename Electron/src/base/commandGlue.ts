import { SocketServer, ICommandListener } from './socketServer';
import { CommandError, ErrorCode } from './commandError';
import { TargetParser } from './targetParser';
import { BlockPosParser } from './blockPosParser';
import { RotationParser } from './rotationParser';
import { OptionalParser } from './optionalParser';
import { NumParser } from './numParser';
import { IParser, IParsable, canParse } from './iParser';
import { getApp, CommandLogType } from './companionApp';

// Interface for easily sending and mapping callbacks to commands and events.
// Request ids are used to call the given callback for a command that was sent, meaning
// that this is not limited to one command at a time.
// If an error occurs trying to send the command, the callback is called with CommandError and null response
// If an error occurs in the response, like the command failed, the callback is called with a CommandError and the response
// If all goes well, the result will be passed back in the callback, and it's up to the caller to parse it as they wish
export class CommandGlue implements ICommandListener {
    // Requestid to callback
    pendingCommands: any = {};
    server: SocketServer;
    // OptionalParser should be first so subsequent parsers can handle an optional parsable type
    parsers: IParser[] = [new OptionalParser(), new TargetParser(), new BlockPosParser(), new NumParser(), new RotationParser()]
    optionalParser: IParser = this.parsers[0];
    eventSubscriptions: any = {};
    onCloseCallback: ()=>void;

    constructor(server: SocketServer) {
        this.server = server;
    }

    addEventSubscription(event: string, callback: (any)=>void) {
        this.eventSubscriptions[event] = callback;
        // Subscriptions are added on connection, but if we're already connected, need to add it now
        if (getApp().server.isConnected()) {
            this.server.subscribeToEvent(event, callback);
        }
    }

    addCloseSubscription(callback: ()=>void) {
        this.onCloseCallback = callback;
    }

    onConnected() {
        this.clearCommand();
        for (let eventName in this.eventSubscriptions) {
            this.server.subscribeToEvent(eventName, this.eventSubscriptions[eventName]);
        }
    }

    getRequestId(command: any): string {
        if (command != null) {
            let header = command.header;
            if (header != null) {
                return header.requestId;
            }
        }
        return null;
    }

    onCommandComplete(response: any) {
        getApp().debugLogCommand(CommandLogType.Complete, response);
        let id = this.getRequestId(response);
        if (id != null) {
            let callback = this.pendingCommands[id];
            if (callback != null) {
                callback(null, response);
                this.pendingCommands[id] = undefined;
                return;
            }
        }
        getApp().debugLog('Failed to map response to callback');
    }

    onClosed() {
        this.clearCommand();
        if (this.onCloseCallback != null) {
            this.onCloseCallback();
        }
    }

    clearCommand() {
        // We're throwing away these commands, give error callbacks so they aren't stuck waiting forever
        let error: CommandError = new CommandError(ErrorCode.NoConnection);
        for (let key in this.pendingCommands) {
            let callback: (CommandError, any)=>void = this.pendingCommands[key];
            if (callback != null) {
                callback(error, null);
            }
        }
        this.pendingCommands = {};
    }

    onCommandResponse(response: any) {
        getApp().debugLog('Command response');
        if (response.body == undefined) {
            getApp().debugLog('Missing body field in instant command response');
        }
        else {
            this.onCommandComplete(response);
        }
    }

    // From ICommandListener
    onError(error: CommandError, response: any) {
        getApp().debugLogCommand(CommandLogType.Failed, response);
        let id = this.getRequestId(response);
        if (id != null) {
            let callback: (CommandError, any)=>void = this.pendingCommands[id];
            if (callback) {
                callback(error, response);
                this.pendingCommands[id] = undefined;
                return;
            }
        }
    }

    validateInputs(commandName: string, commandInput: any[]): ValidateResult {
        let missingKeys: string[] = [];
        let failedParseKeys: string[] = [];
        let inputs: string[] = Object.keys(commandInput);
        let result: ValidateResult = new ValidateResult();
        result.commandLine = `${commandName} `;
        let lastParamSupplied: boolean = true;

        // Look for missing inputs and if there are make a comma separated list in expectedKeys like 'Expected: direction, slotnum'
        inputs.forEach((input: string) => {
            let value: any = commandInput[input];
            let optional: boolean = canParse(this.optionalParser, value);

            // See if this is a parsable type, if it's a plain type nothing will happen
            for (let i = 0; i < this.parsers.length; ++i) {
                let parser: IParser = this.parsers[i];
                if (canParse(parser, value)) {
                    value = parser.parse(value);
                }
            }

            // Undefined means parameter wasn't supplied, which is invalid unless it's optional
            if (value === undefined && optional == false) {
                missingKeys.push(input);
            }
            // Null means a parse fail happend, which is clearly invalid
            else if (value === null) {
                failedParseKeys.push(input);
            }

            if (value != null) {
                // Apply validated input to command line
                result.commandLine += `${value} `;
            }
        });

        result.commandError = null;
        if (missingKeys.length != 0) {
            result.commandError = new CommandError(ErrorCode.RestParseFail);
            result.commandError.errorMessage += `\nMissing: ${missingKeys.join(', ')}`;
        }
        if (failedParseKeys.length != 0) {
            result.commandError = new CommandError(ErrorCode.TargetParseFail);
            result.commandError.errorMessage += `\nFailed to Parse: ${failedParseKeys.join(', ')}`;
        }
        return result;
    }

    runCommand(commandName: string, commandInput: any[], response: (e: CommandError, any)=>void, version: number = 1) {
        let validateError: ValidateResult = this.validateInputs(commandName, commandInput);
        if (validateError.commandError != null) {
            response(validateError.commandError, null);
            return;
        }

        if (!getApp().hasValidatedConnection()) {
            response(new CommandError(ErrorCode.NoConnection), null);
            return;
        }

        let id = this.server.sendCommand(validateError.commandLine, version);
        this.pendingCommands[id] = response;
    }
}

class ValidateResult {
    commandError: CommandError;
    commandLine: string;
}