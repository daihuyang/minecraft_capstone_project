import { InputType } from './InputType';
import { RandomTypeGenerator } from './RandomTypeGenerator';
import { LtcClient } from './LtcClient';
import { CommandStatus } from './CommandStatus';

export class CommandInput {
  key: string;;
  inputType: InputType;
  valueCallback: any;
  // value that used to call command
  usedValue: any;
  constructor(key: string, inputType: InputType, valueCallback: any = undefined) {
    this.key = key;
    this.inputType = inputType;
    this.valueCallback = valueCallback;
  }


  getValue(): any {
    let value;
    if (this.valueCallback !== undefined) {
      value = this.valueCallback();
    } else {
      value = RandomTypeGenerator.GetRandom(this.inputType);
    }
    this.usedValue = value;
    return value;
  }
}

export class Command {
  status: CommandStatus;
  commandName: string;
  inputs: Array<CommandInput>;
  returnKey: string;
  result: string;
  errorString: string;

  constructor(commandName, inputs, returnKey) {
    this.status = CommandStatus.NOT_STARTED;
    this.commandName = commandName;
    this.inputs = inputs;
    this.returnKey = returnKey;
  }

  execute(): void {
    this.status = CommandStatus.WORKING;
    console.log(`Execute command ${this.commandName}`);
    LtcClient.executeCommand(this.createCommandString(), this.getCompletionCallback(), this.returnKey);
  }

  createCommandString(): string {
    var command = this.commandName;
    var inputArray = this.inputs;
    if (inputArray.length) {
      command += '?';
      for (let i = 0; i < inputArray.length; i++) {
        command += `${inputArray[i].key}=${inputArray[i].getValue()}`
        // if there is a valid input after this index, add &
        if (i < inputArray.length - 1) {
          command += '&';
        }
      }
    }
    return command
  }

  isDone(): boolean {
    return this.status === CommandStatus.SUCCEEDED || this.status === CommandStatus.FAILED;
  }

  isSucceeded(): boolean {
    return this.status === CommandStatus.SUCCEEDED;
  }

  getCompletionCallback(): any {
    // returns fat arrow(lambda) callback to use 'this' command inside of the callback
    return (response) => {
      // see whether we can parse response or not
      try {
        this.result = JSON.parse(response);
      } catch (e) {
        this.errorString = response;
      }
      const noResponse = this.result === undefined;
      this.status = noResponse || this.result.hasOwnProperty('errorCode') ? CommandStatus.FAILED : CommandStatus.SUCCEEDED;
      console.log(`${this.commandName} Command done response: ${response}`);
    }
  }

  getRecordString(): string {
    var result = `Command ${this.commandName} ${this.isSucceeded() ? 'Succeeded' : 'Failed'}\n`;
    var inputArray = this.inputs;
    if (inputArray.length) {
      result += `With input -\n`;
      for (let i = 0; i < inputArray.length; i++) {
        result += `${inputArray[i].key} : ${inputArray[i].usedValue}\n`;
      }
    }
    if (this.result !== undefined) {
      result += `Response -\n`;
      var keys = Object.keys(this.result);
      for (let i = 0; i < keys.length; i++) {
        result += `${keys[i]} : ${this.result[keys[i]]}\n`;
      }
    // doesn't get anything from the server
    } else {
      result += `Error : ${this.errorString}\n`;
    }
    return result;
  }
}
