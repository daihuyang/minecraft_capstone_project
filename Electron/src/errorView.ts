import * as electron from 'electron';
import { setupMCButtonEvents } from './mcButton';
import { locFont, locElement } from './base/LocData';
import { ErrorViewInfo } from './errorViewInfo';
let errorLabel: HTMLElement = document.getElementById('ErrorLabel');
let exitButton: HTMLElement = document.getElementById('ExitButton');
let backButton: HTMLElement = document.getElementById('BackButton');
let downloadLink: HTMLElement = document.getElementById('DownloadLink');
let titleText: HTMLElement = document.getElementById('TitleText');
const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;

function setVisible(element: HTMLElement, visible: boolean) {
    element.style.visibility = visible ? 'visible' : 'hidden';
}

electron.ipcRenderer.on('setError', (event: Electron.Event, info: ErrorViewInfo) => {
    let font: string = locFont(info.message);
    if(font != null) {
        errorLabel.style.fontFamily = font;
    }
    errorLabel.insertAdjacentText('beforeend', info.message);
    setVisible(backButton, info.showBack);
    setVisible(downloadLink, info.showLink);
    // If we're not showing back arrow, shift title text over so there isn't an awkward space
    if(!info.showBack) {
        titleText.classList.add('left');
    }
});

exitButton.addEventListener('click', (event: MouseEvent) => {
    ipcRenderer.send('exit');
});

backButton.addEventListener('click', (event: MouseEvent) => {
    ipcRenderer.send('backFromError');
});

// Intercept clicking link so we don't open it in electron
downloadLink.addEventListener('click', (event: MouseEvent) => {
    electron.shell.openExternal(downloadLink.getAttribute('href'));
    event.preventDefault();
});

setupMCButtonEvents(exitButton);
setupMCButtonEvents(backButton);
locElement('error.title', titleText);
