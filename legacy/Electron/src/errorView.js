"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron = require("electron");
const mcButton_1 = require("./mcButton");
const LocData_1 = require("./base/LocData");
let errorLabel = document.getElementById('ErrorLabel');
let exitButton = document.getElementById('ExitButton');
let backButton = document.getElementById('BackButton');
let downloadLink = document.getElementById('DownloadLink');
let titleText = document.getElementById('TitleText');
const ipcRenderer = electron.ipcRenderer;
function setVisible(element, visible) {
    element.style.visibility = visible ? 'visible' : 'hidden';
}
electron.ipcRenderer.on('setError', (event, info) => {
    let font = LocData_1.locFont(info.message);
    if (font != null) {
        errorLabel.style.fontFamily = font;
    }
    errorLabel.insertAdjacentText('beforeend', info.message);
    setVisible(backButton, info.showBack);
    setVisible(downloadLink, info.showLink);
    // If we're not showing back arrow, shift title text over so there isn't an awkward space
    if (!info.showBack) {
        titleText.classList.add('left');
    }
});
exitButton.addEventListener('click', (event) => {
    ipcRenderer.send('exit');
});
backButton.addEventListener('click', (event) => {
    ipcRenderer.send('backFromError');
});
// Intercept clicking link so we don't open it in electron
downloadLink.addEventListener('click', (event) => {
    electron.shell.openExternal(downloadLink.getAttribute('href'));
    event.preventDefault();
});
mcButton_1.setupMCButtonEvents(exitButton);
mcButton_1.setupMCButtonEvents(backButton);
LocData_1.locElement('error.title', titleText);
//# sourceMappingURL=errorView.js.map