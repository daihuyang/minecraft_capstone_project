import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { gotoView, getWindow, getShouldOpenDevTools, gotoURL, createBrowserWindow } from './main';
import { getApp } from './base/companionApp';
import { Color, EditorButton } from './editorButton';
import * as url from 'url';
import * as messages from './messages';
import * as fs from 'fs';
import * as fixedEditors from './fixedEditors';

export class ConnectedViewController {
    customButtonCount: number = 2;
    editorButtons: EditorButton[];
    editingButtonIndex: number = -1;
    saveFile: string = `${app.getPath('appData')}/${app.getName()}/editors.json`;
    // If we have decided we are hosting an editor, so true before the editor finishes loading, and flipped to false before connected view finishes loading
    isHostingEditor: boolean = false;

    constructor() {
        this.loadEditorButtons();
        // Apply so this is ConnectedViewController, not whoever triggered the event. Thanks javascript.
        ipcMain.on('customButtonClick', (a, b, c) => this.onCustomButtonClick.apply(this, [a, b, c]));
        ipcMain.on('openEditor', (a, b) => this.onOpenEditor.apply(this, [a, b]));
        ipcMain.on('backFromEdit', () => this.onBackFromEdit.apply(this));
        ipcMain.on('saveEditor', (a, b) => this.onSaveEditor.apply(this, [a, b]));
        ipcMain.on('deleteEditor', () => this.onDeleteEditor.apply(this));
    }

    //public
    init() {
        this.gotoConnectedView();
    }

    getIsHostingEditor(): boolean {
        return this.isHostingEditor;
    }

    //private
    onBackFromEdit() {
        this.gotoConnectedView();
    }

    onSaveEditor(event: Electron.Event, editor: EditorButton) {
        this.saveEditor(this.editingButtonIndex, editor);
        this.editingButtonIndex = -1;
        this.gotoConnectedView();
        this.saveEditorButtons();
    }

    saveEditor(index: number, editor: EditorButton) {
        if (this.isPlaceholderEditor(editor)) {
            return;
        }
        this.editorButtons[this.editingButtonIndex] = editor;
        this.updateActiveStates();
    }

    onDeleteEditor() {
        // Shift everything over with the hole created by the deletion
        for(let i = this.editingButtonIndex; i + 1 < this.editorButtons.length; ++i) {
            this.editorButtons[i] = this.editorButtons[i + 1];
        }
        // Put placehodler editor at the empty slot on the end
        this.editorButtons[this.editorButtons.length - 1] = this.createPlaceholderEditor(false);
        this.editingButtonIndex = -1;
        this.updateActiveStates();
        this.gotoConnectedView();
        this.saveEditorButtons();
    }

    // We always want the element to the right of the last non-empty link to be active so it is an 'Add Service' button
    updateActiveStates() {
        let lastNonEmpty = this.editorButtons.length;
        for (let i = 0; i < this.editorButtons.length; ++i) {
            if (this.isPlaceholderEditor(this.editorButtons[i])) {
                lastNonEmpty = i - 1;
                break;
            }
            this.editorButtons[i].active = true;
        }
        let empty = lastNonEmpty + 1;
        if (empty < this.editorButtons.length) {
            this.editorButtons[empty].active = true;
        }
        for (let i = empty + 1; i < this.editorButtons.length; ++i) {
            this.editorButtons[i].active = false;
        }
    }

    onCustomButtonClick(event: Electron.Event, inEditMode: boolean, buttonIndex: number) {
        let button: EditorButton = this.editorButtons[buttonIndex];
        // Link is empty if this is an 'Add Service' button
        if (this.isPlaceholderEditor(button) || inEditMode) {
            this.editingButtonIndex = buttonIndex;
            this.gotoEditView();
        }
        // Else this button has a link and we want to go to it
        else {
            // Mac won't open a url in default browser unless it starts with http://
            let url = button.link.trim();
            if (!url.includes('http')) {
                url = `http://${url}`
            }

            getApp().telemetry.fireEditorButtonPressed('Custom', url);

            // Since we self host tynker we want to host their links too in our webview.
            // Pxt doesn't have interesting links and scratch is always external
            if (button.link.includes('tynker')) {
                this.isHostingEditor = true;
                gotoURL(fixedEditors.Tynker, () => {
                    getWindow().webContents.send('openInWebview', url);
                });
            }
            else {
                this.openEditor({
                    editorType: messages.EditorType.External,
                    url: url
                });
            }
        } 
    }

    loadEditorButtons() {
        // Fill placeholder buttons in case we don't load successfully (Now 2 buttons down from 3)
        this.editorButtons = [];
        for(let i = 0; i < this.customButtonCount; ++i) {
            this.editorButtons.push(this.createPlaceholderEditor(false));
        }
        this.editorButtons[0].active = true;

        fs.readFile(this.saveFile, (err: NodeJS.ErrnoException, data: Buffer) => {
            // Something is bad, whatever, we'll use the placeholder values and write over this bad file the next time any button is changed
            if (err != null) {
                return;
            }
            let editors: EditorButton[] = [];
            try {
                editors = JSON.parse(data.toString('utf8'));
            }
            // If it doesn't parse, the file was somehow corrupted, perhaps the user manually manipulated it?
            // Either way, return now and use the placehoder buttons
            catch(e) {
                return;
            }
            // Validate contents before using them
            for(let i = 0; i < this.editorButtons.length; ++i) {
                let savedButton: EditorButton = editors[i];
                // Should be very rare, but if something is amiss with this object, forget the whole thing
                // Could try to read the rest of them, but this should be so niche that it's not worth the effort
                if (!this.isValidEditor(savedButton)) {
                    break;
                }
                this.editorButtons[i] = savedButton;
            }
            this.updateActiveStates();
        });
    }

    isPlaceholderEditor(editor: EditorButton) {
        return editor.link == '';
    }

    isValidEditor(editor: EditorButton) {
        return editor != null  &&
        typeof(editor.active) == 'boolean' &&
        typeof(editor.color) == 'object' &&
        typeof(editor.color.r) == 'number' &&
        typeof(editor.color.g) == 'number' &&
        typeof(editor.color.b) == 'number' &&
        typeof(editor.link) == 'string' &&
        typeof(editor.name) == 'string';
    }

    saveEditorButtons() {
        let editors: EditorButton[] = [];
        // Only save editors that aren't placeholder buttons
        for (let i = 0; i < this.editorButtons.length; ++i) {
            let editor: EditorButton = this.editorButtons[i];
            if (!this.isPlaceholderEditor(editor)) {
                editors.push(editor);
            }
        }
        fs.writeFile(this.saveFile, JSON.stringify(editors), ()=>{});
    }

    gotoEditView() {
        gotoView('editView.html', () => {
            let editor: EditorButton = this.editorButtons[this.editingButtonIndex];
            if (this.isPlaceholderEditor(editor)) {
                editor = new EditorButton('', '', new Color(0, 0, 0), true);
            }
            getWindow().webContents.send('fillEditView', editor);
        });
    }

    gotoConnectedView() {
        this.isHostingEditor = false;
        gotoView('connectedView.html', () => {
            getWindow().webContents.send('setConnectedString', getApp().server.getConnectedIP());
            getWindow().webContents.send('setEditorButtons', this.editorButtons);
        });
    }

    addDevToolsQueryString(windowUrl: string): string {
        if (windowUrl && windowUrl.indexOf('file://') === 0 && getShouldOpenDevTools()) {
            const parsedUrl = url.parse(windowUrl, true);
            if (process.platform === "win32" && parsedUrl.host[parsedUrl.host.length - 1] !== ":") {
                // url.parse() removes the ":" of the drive letter on Windows; add it back.
                parsedUrl.host += ':';
            }
            parsedUrl.query['openDevTools'] = true;
            windowUrl = url.format(parsedUrl);
        }

        return windowUrl;
    }

    openEditor(params: messages.OpenEditorMessage) {
        params.url = this.addDevToolsQueryString(params.url);

        switch (params.editorType) {
            case messages.EditorType.External:
                shell.openExternal(params.url);
                break;
            case messages.EditorType.SameWindow:
                this.isHostingEditor = true;
                gotoURL(params.url, null);
                break;
        }
    }

    onOpenEditor(event: Electron.Event, params: messages.OpenEditorMessage) {
        // Providing url for built in buttons doesn't make sense since we alredy know from the type and might be local files like pxt.html
        getApp().telemetry.fireEditorButtonPressed(params.buttonType, null);
        this.openEditor(params);
    };

    createPlaceholderEditor(active: boolean): EditorButton {
        return new EditorButton(getApp().localize('connected.addservice'), '', new Color(255, 255, 255), active);
    }
}