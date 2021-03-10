"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DebugMessageBase {
}
exports.DebugMessageBase = DebugMessageBase;
class SimpleDebugMessage extends DebugMessageBase {
    constructor(message) {
        super();
        this.message = message;
    }
    toString() {
        return this.message;
    }
}
exports.SimpleDebugMessage = SimpleDebugMessage;
class CommandDebugMessageBase extends DebugMessageBase {
    constructor(command) {
        super();
        this.command = command;
    }
    toString() {
        let commandText = this.command;
        try {
            // Attempt to format the command using spacing
            commandText = JSON.stringify(JSON.parse(commandText), null, 2);
        }
        catch (e) { }
        // Add indentation for the command body
        commandText = '  ' + commandText.split(/\r?\n/g).join('\n  ');
        return `${this.header}\n${commandText}`;
    }
}
exports.CommandDebugMessageBase = CommandDebugMessageBase;
class CommandFailedDebugMessage extends CommandDebugMessageBase {
    constructor(command) {
        super(command);
        this.color = 'red';
        this.header = 'Command failed:';
    }
}
exports.CommandFailedDebugMessage = CommandFailedDebugMessage;
class CommandCompleteDebugMessage extends CommandDebugMessageBase {
    constructor(command) {
        super(command);
        this.color = 'green';
        this.header = 'Command complete:';
    }
}
exports.CommandCompleteDebugMessage = CommandCompleteDebugMessage;
class RunningCommandDebugMessage extends CommandDebugMessageBase {
    constructor(command) {
        super(command);
        this.color = 'blue';
        this.header = 'Running command:';
    }
}
exports.RunningCommandDebugMessage = RunningCommandDebugMessage;
//# sourceMappingURL=debugMessage.js.map