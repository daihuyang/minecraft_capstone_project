import { Command } from './Command';


export default class CommandFactory {
    commandTypes: { [key: string]: Command } = {};


    constructor() {
    }

    addCommand(commandType: Command): void {
        if (this.commandTypes[commandType.commandName] === undefined) {
            this.commandTypes[commandType.commandName] = commandType;
        } else {
            console.log(`Duplicate command type : ${commandType.commandName}`);
        }
    }

    createCommand(type: string): Command {
        var commandType = this.commandTypes[type];
        if (commandType === undefined) {
            return null;
        } else {
            // deep copy the command type
            return Object.create(commandType);
        }
    }

    createRandomCommand(): Command {
        var keys = Object.keys(this.commandTypes);
        return this.createCommand(keys[Math.floor(keys.length * Math.random())]);
    }

}