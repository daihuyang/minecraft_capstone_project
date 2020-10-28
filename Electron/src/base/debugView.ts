import * as electron from 'electron';

let textBox: HTMLElement = document.getElementById('TextBox');
let clearButton: HTMLElement = document.getElementById('ClearButton');
const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;

electron.ipcRenderer.on('log', (event: Electron.Event, text: string) => {
    writeText(text);
});

electron.ipcRenderer.on('logCommand', (event: Electron.Event, commandText: string, color: string) => {
    writeText(commandText, color);
});

function writeText(text: string, color?: string) {
    const pre: HTMLPreElement = document.createElement('pre');  // <pre> preserves newlines and spaces
    pre.textContent = text;
    pre.style.margin = "5px 0px 5px 2px";
    if (color) {
        pre.style.color = color;
    }
    textBox.insertAdjacentElement('beforeend', pre);

    // Scroll to bottom
    textBox.scrollTop = textBox.scrollHeight;
}

clearButton.addEventListener('click', (event: MouseEvent) => {
    location.reload();
});