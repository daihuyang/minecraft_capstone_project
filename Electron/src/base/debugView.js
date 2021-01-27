"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron = require("electron");
let textBox = document.getElementById('TextBox');
let clearButton = document.getElementById('ClearButton');
const ipcRenderer = electron.ipcRenderer;
electron.ipcRenderer.on('log', (event, text) => {
    writeText(text);
});
electron.ipcRenderer.on('logCommand', (event, commandText, color) => {
    writeText(commandText, color);
});
function writeText(text, color) {
    const pre = document.createElement('pre'); // <pre> preserves newlines and spaces
    pre.textContent = text;
    pre.style.margin = "5px 0px 5px 2px";
    if (color) {
        pre.style.color = color;
    }
    textBox.insertAdjacentElement('beforeend', pre);
    // Scroll to bottom
    textBox.scrollTop = textBox.scrollHeight;
}
clearButton.addEventListener('click', (event) => {
    location.reload();
});
//# sourceMappingURL=debugView.js.map