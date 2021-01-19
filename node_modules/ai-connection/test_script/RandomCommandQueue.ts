import { CommandQueue } from './CommandQueue';
import CommandFactory from './CommandFactory';
import { Command } from './Command';

export enum RandomCommandQueueMode {
    INFINITE,
    FINITE
}

export class RandomCommandQueue extends CommandQueue {
    commandFactory: CommandFactory
    count: number
    mode: RandomCommandQueueMode
    constructor(commandFactory: CommandFactory, mode: RandomCommandQueueMode, count: number = 10) {
        super();
        this.mode = mode;
        this.count = count;
        this.commandFactory = commandFactory;
    }

    canGetNextCommand(): boolean {
        if (this.mode === RandomCommandQueueMode.INFINITE) {
            return true;
        } else {
            return this.count > 0;
        }
    }

    getNextCommand(): Command {
        // TODO : Using previous command's output to select current command
        return this.commandFactory.createRandomCommand();
    }
}