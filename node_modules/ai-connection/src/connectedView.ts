require('./menuBar');
import * as electron from 'electron';
import { EditorType, OpenEditorMessage } from './messages';
import { Color, EditorButton } from './editorButton';
import * as fixedEditors from './fixedEditors';
import { setupMCButtonEvents } from './mcButton';
import { LocResult, locElement } from './base/LocData';

let connectedLabel: HTMLElement = document.getElementById('ConnectedLabel');
let pxtButton: HTMLElement = document.getElementById('PXTButton');
let scratchButton: HTMLElement = document.getElementById('ScratchButton');
let tynkerButton: HTMLElement = document.getElementById('TynkerButton');
let codeStudioButton: HTMLElement = document.getElementById('CodeStudioButton');
let thenThatButton: HTMLElement = document.getElementById('ThenThatButton');
let customButtons: HTMLElement[] = [document.getElementById('CustomButtonA'), document.getElementById('CustomButtonB')];
let fixedButtons: HTMLElement[] = [pxtButton, scratchButton, tynkerButton, codeStudioButton];
let editButton: HTMLElement = document.getElementById('EditLinksButton');


const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;
let inEditMode: boolean = false;
const editingColor: Color = new Color(55, 55, 55);

setupMCButtonEvents(editButton);

ipcRenderer.on('setConnectedString', (event: Electron.Event, text) => {
    connectedLabel.insertAdjacentText('beforeend', ' ' + text);
});

ipcRenderer.on('setEditorButtons', (event: Electron.Event, buttons: EditorButton[]) => {
    for(let i = 0; i < buttons.length; ++i) {
        let element = customButtons[i];
        let buttonData = buttons[i];
        locElement(buttonData.name, element);
        element.style.visibility = buttonData.active ? 'visible' : 'hidden';
        element.style.backgroundColor = Color.toStyle(buttonData.color);
        // Add context menu for all buttons that are not the 'Add Service' buttons
        if (buttonData.link != '') {
            element.addEventListener('contextmenu', (event: MouseEvent) => {
                if (event.button == 2 && customButtons[i]) {
                    let editServiceResult: LocResult = ipcRenderer.sendSync('loc', 'connected.context.editservice');
                    let deleteServiceResult: LocResult = ipcRenderer.sendSync('loc', 'connected.context.deleteservice');
                    let ctxMenu = electron.remote.Menu.buildFromTemplate([
                    {
                        'label': editServiceResult.text,
                        click () { sendCustomClick(true, i); }
                    },
                    {
                        'label': deleteServiceResult.text,
                        click () { deleteButtonContexet(i); }
                    }
                    ]);
                    ctxMenu.popup();
                    // Reset hover state because it'll get stuck otherwise
                    element.classList.remove('hover');
                    element.classList.remove('active'); 
                }
            });
        }
    }
});

editButton.addEventListener('click', (event: MouseEvent) => {
    inEditMode = !inEditMode;

    // Fixed buttons can't be edited, so disable them to indicate this
    fixedButtons.forEach((button: HTMLElement) => {
        (button as HTMLButtonElement).disabled = inEditMode;
    });
    customButtons.forEach((button: HTMLElement) => {
        button.style.color = inEditMode ? 'white' : 'black';
        let oldStyle = 'oldBackgroundColor';
        // Store old color so we can go back to it when edit mode is turned off
        if (inEditMode) {
            button[oldStyle] = button.style.backgroundColor;
            button.style.backgroundColor = Color.toStyle(editingColor);
        }
        else {
            button.style.backgroundColor = button[oldStyle];
        }
    });
});

function sendCustomClick(isEditMode: boolean, buttonIndex: number) {
    ipcRenderer.send('customButtonClick', isEditMode, buttonIndex);
}

function deleteButtonContexet(buttonIndex: number) {
    sendCustomClick(true, buttonIndex);
    ipcRenderer.send('deleteEditor');
}

for (let i = 0; i < customButtons.length; ++i) {
    let button: HTMLElement = customButtons[i];
    button.addEventListener('click', () => {
        sendCustomClick(inEditMode, i);
    });
    setupMCButtonEvents(button);
}

function openWindowButton(url: string, button: HTMLElement, type: EditorType, splitView: boolean = false) {
    button.addEventListener('click', (event: MouseEvent) => {
        const msg: OpenEditorMessage = {
            editorType: type,
            windowInfo: {
                splitView
            },
            url,
            buttonType: button.innerText
        };
        ipcRenderer.send('openEditor', msg);
    });
    setupMCButtonEvents(button);
}

openWindowButton(fixedEditors.Pxt, pxtButton, EditorType.SameWindow);
openWindowButton(fixedEditors.Scratch, scratchButton, EditorType.External);
openWindowButton(fixedEditors.Tynker, tynkerButton, EditorType.SameWindow);
openWindowButton(fixedEditors.CodeStudio, codeStudioButton, EditorType.SameWindow);
openWindowButton(fixedEditors.ThenThat, thenThatButton, EditorType.SameWindow);
