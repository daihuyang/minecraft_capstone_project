"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class LocResult {
    constructor(text, font) {
        this.text = text;
        this.font = font;
    }
}
exports.LocResult = LocResult;
function locElementById(key, id) {
    let element = document.getElementById(id);
    locElement(key, element);
}
exports.locElementById = locElementById;
function locElement(key, element) {
    if (element != null) {
        let locResult = electron_1.ipcRenderer.sendSync('loc', key);
        element.textContent = locResult.text;
        if (locResult.font != null) {
            element.style.fontFamily = locResult.font;
        }
    }
}
exports.locElement = locElement;
function locFont(text) {
    let fontName = electron_1.ipcRenderer.sendSync('locFont', text);
    return fontName;
}
exports.locFont = locFont;
//# sourceMappingURL=LocData.js.map