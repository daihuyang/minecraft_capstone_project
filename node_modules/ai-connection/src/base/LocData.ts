import { ipcRenderer } from 'electron'

export class LocResult {
    text: string;
    font: string;

    constructor(text: string, font: string) {
        this.text = text;
        this.font = font;
    }
}

export function locElementById(key: string, id: string) {
    let element: HTMLElement = document.getElementById(id);
    locElement(key,element);
}

export function locElement(key: string, element: HTMLElement) {
    if(element != null) {
        let locResult: LocResult = ipcRenderer.sendSync('loc', key);
        element.textContent = locResult.text;
        if(locResult.font != null) {
            element.style.fontFamily = locResult.font;
        }
    }
}

export function locFont(text: string): string {
    let fontName: string = ipcRenderer.sendSync('locFont', text);
    return fontName;
}
    