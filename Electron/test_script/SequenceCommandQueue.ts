import { CommandQueue } from './CommandQueue';
import { Command } from './Command';


export class SequenceCommandQueue extends CommandQueue {
    commandList: Array<Command>;
    constructor() {
        super();
        this.commandList = [];
    }

    addCommand(command: Command): void {
        this.commandList.push(command);
    }

    canGetNextCommand(): boolean {
        return this.commandList.length > 0;
    }

    getNextCommand(): Command {
        return this.commandList.shift();
    }
}