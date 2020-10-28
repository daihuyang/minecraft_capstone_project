require('./menuBar');
let copyButton: HTMLElement = document.getElementById('CopyButton');
let commandLabel: HTMLInputElement = <HTMLInputElement> document.getElementById('CommandLabel');
let versionNumber: HTMLInputElement = <HTMLInputElement> document.getElementById('VersionNumber');
import * as electron from 'electron';
import { setupMCButtonEvents } from './mcButton';
import { Build } from './base/sharedConstants';
const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;

setupMCButtonEvents(copyButton);

copyButton.addEventListener('click', (event: MouseEvent) => {
    electron.clipboard.writeText(commandLabel.value);
});

ipcRenderer.on('setCommandString', (event: Electron.Event, arg) => {
    commandLabel.value = arg;
});

//display the version number of CC at the waitingView screen
versionNumber.textContent = "v" + Build;