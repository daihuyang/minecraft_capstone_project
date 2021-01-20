export abstract class DebugMessageBase {
    public abstract toString(): string;
}

export class SimpleDebugMessage extends DebugMessageBase {
    constructor(public message: string) {
        super();
    }

    toString() {
        return this.message;
    }
}

export abstract class CommandDebugMessageBase extends DebugMessageBase {
    public color: string; // Color for the command body in the debug view
    public header: string; // The header to print before the command body

    constructor(public command: string) {
        super();
    }

    toString() {
        let commandText: string = this.command;
        try {
            // Attempt to format the command using spacing
            commandText = JSON.stringify(JSON.parse(commandText), null, 2);
        } catch (e) { }

        // Add indentation for the command body
        commandText = '  ' + commandText.split(/\r?\n/g).join('\n  ');
        return `${this.header}\n${commandText}`;
    }
}

export class CommandFailedDebugMessage extends CommandDebugMessageBase {
    constructor(command: string) {
        super(command);
        this.color = 'red';
        this.header = 'Command failed:';
    }
}

export class CommandCompleteDebugMessage extends CommandDebugMessageBase {
    constructor(command: string) {
        super(command);
        this.color = 'green';
        this.header = 'Command complete:';
    }
}

export class RunningCommandDebugMessage extends CommandDebugMessageBase {
    constructor(command: string) {
        super(command);
        this.color = 'blue';
        this.header = 'Running command:';
    }
}