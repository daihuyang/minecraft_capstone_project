require('./menuBar');
import * as electron from 'electron';
import { EditorButton, Color } from './editorButton';
import { setupMCButtonEvents } from './mcButton';

const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;

let backButton: HTMLButtonElement = document.getElementById('BackButton') as HTMLButtonElement;
let saveButton: HTMLButtonElement = document.getElementById('Save') as HTMLButtonElement;
let deleteButton: HTMLButtonElement = document.getElementById('Delete') as HTMLButtonElement;
let nameInput: HTMLInputElement = document.getElementById('NameInput') as HTMLInputElement;
let linkInput: HTMLInputElement = document.getElementById('LinkInput') as HTMLInputElement;
let colorInputs: HTMLCollectionOf<Element> = document.getElementsByClassName('colorRadio');
let colorRadios: NodeListOf<HTMLElement> = document.getElementsByName('color');

setupMCButtonEvents(backButton);
setupMCButtonEvents(saveButton);
setupMCButtonEvents(deleteButton);

nameInput.maxLength = EditorButton.maxNameLength;

const colorAnchorLeft: number = 55;
const colorAnchorTop: number = 330;
const colorPadding: number = 0;
const defaultColorIndex: number = 9;
let idToColor: any = {};
let colors: Color[] = [
    new Color(255, 0, 10)
    , new Color(255, 156, 0)
    , new Color(252, 255, 0)
    , new Color(0, 255, 18)
    , new Color(0, 246, 255)
    , new Color(0, 0, 255)
    , new Color(162, 0, 255)
    , new Color(255, 0, 156)
    , new Color(198, 198, 198)
    , new Color(255, 255, 255)
    ];

// Line up all the color buttons and assign colors to them
for (let i = 0; i < colorInputs.length; ++i) {
    let element: HTMLElement = colorInputs[i] as HTMLElement;
    let style = window.getComputedStyle(element);
    // Strip off non-alphanumeric characters and get width int
    let width: number = Number.parseInt(style.width.replace('px', ''));
    let px = 'px';
    element.style.left = (colorAnchorLeft + i*(width + colorPadding)).toString() + px;
    element.style.top = colorAnchorTop + px;
    element.style.backgroundColor = Color.toStyle(colors[i]);
    // Since the label has the color but the radio button is checked, get the id the label is for so we can store the color
    idToColor[element.getAttribute('for')] = colors[i];
}

function isValidLink(link: string): boolean {
    // Don't want to deal with full url validation
    return link.trim() != '';
}

linkInput.addEventListener('input', (event: KeyboardEvent) => {
    // Enable disable save button if the link field is nonempty
    saveButton.disabled = !isValidLink(linkInput.value);
});

backButton.addEventListener('click', (event: MouseEvent) => {
    ipcRenderer.send('backFromEdit');
});

saveButton.addEventListener('click', (event: MouseEvent) => {
    // Shouldn't be possible not to find the color
    let foundColor: Color = null;
    // Find the checked element and use its id to retrieve the color since the radio button doesn't contain it, its label does
    for (let i = 0; i < colorRadios.length; ++i) {
        let element: HTMLInputElement = colorRadios[i] as HTMLInputElement;
        if (element.checked) {
            foundColor = idToColor[element.id];
            break;
        }
    }

    ipcRenderer.send('saveEditor', new EditorButton(nameInput.value, linkInput.value, foundColor, true));
});

deleteButton.addEventListener('click', (event: MouseEvent) => {
    ipcRenderer.send('deleteEditor');
});

ipcRenderer.on('fillEditView', (event: Electron.Event, editor: EditorButton) => {
    // If link is empty, this is a new button, so deleting it doesn't make sense
    if (editor.link == '') {
        deleteButton.disabled = true;
    }
    nameInput.value = editor.name;
    linkInput.value = editor.link;

    saveButton.disabled = !isValidLink(linkInput.value);

    let found: boolean = false;
    for (let i = 0; i < colors.length; ++i) {
        if (Color.equals(colors[i], editor.color)) {
            // Id corrseponds to index in color array, so we can use that to get and check it
            (document.getElementById(i.toString()) as HTMLInputElement).checked = true;
            found = true;
            break;
        }
    }
    // If not found, set deafault
    if (!found) {
        (document.getElementById(defaultColorIndex.toString()) as HTMLInputElement).checked = true;
    }
});