import * as electron from 'electron';
import { setupMCButtonEvents, clearHoverState } from './mcButton';

let exitButton: HTMLElement = document.getElementById('ExitButton');
let minButton: HTMLElement = document.getElementById('MinimizeButton');

const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;

setupMCButtonEvents(minButton);
setupMCButtonEvents(exitButton);

minButton.addEventListener('click', (event: MouseEvent) => {
    clearHoverState(minButton);
    ipcRenderer.send('minimize');
});

exitButton.addEventListener('click', (event: MouseEvent) => {
    ipcRenderer.send('exit');
});