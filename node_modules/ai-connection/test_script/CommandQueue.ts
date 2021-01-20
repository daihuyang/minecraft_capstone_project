import { CommandStatus } from './CommandStatus';
import { Command } from './Command';
import * as Utility from './Utility';
import * as fs from 'fs';

export enum RecordMode {
  ALL,
  ERROR_ONLY
}

export abstract class CommandQueue {
  status: CommandStatus;
  currentCommand: Command;
  recordMode: RecordMode;
  fileDir: string;

  constructor(recordMode = RecordMode.ERROR_ONLY) {
    this.status = CommandStatus.NOT_STARTED;
    this.currentCommand = null;
    this.fileDir = `${__dirname}/result/LTC_TestScript_${Utility.getDateTimeString()}.txt`;
    this.recordMode = recordMode;

    fs.writeFileSync(this.fileDir, 'LTC Test script result\n');
  }

  begin(): void {
    this.status = CommandStatus.WORKING;
  }

  isDone(): boolean {
    return this.status === CommandStatus.SUCCEEDED;
  }

  abstract canGetNextCommand(): boolean;
  abstract getNextCommand(): Command;

  update(): void {
    if (this.status === CommandStatus.WORKING) {
      // if there is no current command
      if (this.currentCommand === null) {
        if (this.canGetNextCommand()) {
          this.currentCommand = this.getNextCommand();
          this.currentCommand.execute();
        } else {
          this.status = CommandStatus.SUCCEEDED;
        }
        // if thre is a current command and it's done
      } else if (this.currentCommand.isDone()) {
        this.recordResult();
        this.currentCommand = null;
      }
    }
  }

  recordResult(): void {
    if (this.recordMode === RecordMode.ALL) {
      fs.appendFileSync(this.fileDir, `${this.currentCommand.getRecordString()}\n`);
    } else if (this.recordMode === RecordMode.ERROR_ONLY) {
      if (!this.currentCommand.isSucceeded()) {
        fs.appendFileSync(this.fileDir, `${this.currentCommand.getRecordString()}\n`);
      }
    }
  }
}