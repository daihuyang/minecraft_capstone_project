"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('./menuBar');
let copyButton = document.getElementById('CopyButton');
let commandLabel = document.getElementById('CommandLabel');
let versionNumber = document.getElementById('VersionNumber');
const electron = require("electron");
const mcButton_1 = require("./mcButton");
const sharedConstants_1 = require("./base/sharedConstants");
const ipcRenderer = electron.ipcRenderer;
mcButton_1.setupMCButtonEvents(copyButton);
copyButton.addEventListener('click', (event) => {
    electron.clipboard.writeText(commandLabel.value);
});
ipcRenderer.on('setCommandString', (event, arg) => {
    commandLabel.value = arg;
});
//display the version number of CC at the waitingView screen
versionNumber.textContent = "v" + sharedConstants_1.Build;
//# sourceMappingURL=waitingView.js.map