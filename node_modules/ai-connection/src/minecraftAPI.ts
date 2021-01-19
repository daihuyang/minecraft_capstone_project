import { ipcRenderer } from 'electron';

let callbacks: any = {};
let listenerCallback: (message: string)=>void = null;

export function sendToMinecraft(message: string) {
    ipcRenderer.send('sendToMinecraft', message);
}

export function setMinecraftListener(callback: (message: string)=>void) {
    listenerCallback = callback;
    ipcRenderer.send('setRawListening', callback != null);
}

ipcRenderer.on('responseFromMinecraft', (event, message) => {
    if (listenerCallback != null) {
        listenerCallback(message);
    }
});