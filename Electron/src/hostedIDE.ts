import { ipcRenderer, remote, shell } from 'electron';
import * as messages from './messages';
import * as constants from './base/sharedConstants.js';
import * as url from 'url';
import * as minecraftApi from './minecraftAPI';
import { setupMCButtonEvents } from './mcButton';
import { LocResult, locElement, locFont } from './base/LocData';

const editor: Electron.WebviewTag = document.getElementById('Editor') as Electron.WebviewTag;

class ExitDialog {
    constructor(choosEditorButtonHandler:(this: HTMLElement, ev: MouseEvent) => any) {
            this.cancelButton = document.getElementById('CancelButton');
            this.exitButton = document.getElementById('ExitButton');
            this.exitDialog = document.getElementById('ExitDialog');
            this.chooseEditorButton = document.getElementById('ChooseEditorButton');

            this.quitBody = document.getElementById('quitBody');
            this.disclamerBody = document.getElementById('disclamerBody');

            locElement('exitDialog.quitBody', this.quitBody);
            locElement('exitDialog.disclamerBody', this.disclamerBody);
            this.cancelButton.onclick = (event:MouseEvent) => { this.exitDialog.classList.remove("dialog-overlay-show"); };
            locElement('exitDialog.cancel', this.cancelButton);

            this.exitButton.onclick = (event:MouseEvent) => { ipcRenderer.send('exit'); };
            locElement('exitDialog.exit', this.exitButton);

            this.chooseEditorButton.onclick = choosEditorButtonHandler;
            locElement('exitDialog.home', this.chooseEditorButton);
    }

    public ShowDialog() {
        this.exitDialog.classList.add("dialog-overlay-show")
    }

    public DismissDialog() {
        this.exitDialog.classList.remove("dialog-overlay-show")
    }

    private quitBody:HTMLElement;
    private disclamerBody:HTMLElement;

    private cancelButton:HTMLElement;
    private exitButton:HTMLElement;
    private exitDialog:HTMLElement;
    private chooseEditorButton:HTMLElement;
}

const backButton = document.getElementById('BackButton');
const minButton = document.getElementById('MinimizeButton');
const maxButton = document.getElementById('MaximizeButton');
const closeButton = document.getElementById('CloseButton');

const exitDialog: ExitDialog = new ExitDialog(handleBackButton);

const body = document.getElementsByTagName('body')[0];
const title = document.getElementById('TitleText');
const headerBar = document.getElementById('Header');
const loadingLabel = document.getElementById('LoadingLabel');
const win: Electron.BrowserWindow = getBrowserWindow();

function locResult(key: string): LocResult {
    return ipcRenderer.sendSync('loc', key);
}

const shouldOpenDevTools: string = 'shouldOpenDevTools';
const internetMsg: LocResult = locResult('editor.ensureinternet');

let isEditorLoaded: boolean = false;
let editorName: string;

export function setupEditorName(name: string) {
    editorName = name;
    document.title = constants.ApplicationName;
    title.textContent = ` - ${editorName}`;
    title.style.paddingLeft = "240px";
    locElement('editor.loading', loadingLabel);
    loadingLabel.textContent += ` ${editorName}...`;
}

/**
 * Gets the Electron browser window hosting this page. Looks through all browser windows to find the one whose URL
 * matches that of the current web page.
 */
function getBrowserWindow() {
    return remote.BrowserWindow.getAllWindows().find((w) => {
        if ((w as any).getURL() === window.location.href) {
            return true;
        }
        return false
    });
}

function onUnmaximized() {
    maxButton.classList.remove('isMaximized');
}

function handleBackButton(event: MouseEvent){
    exitDialog.DismissDialog();

    const msg: messages.ExitEditorMessage = {
        isEditorLoaded
    };
    win.removeListener('unmaximize', onUnmaximized);
    body.classList.remove('hideBackground');
    title.classList.remove('absolute');
    headerBar.classList.add('hidden');
    if (editor != null) {
        editor.classList.add('hide');
    }
    maxButton.classList.add('hidden');
    minButton.classList.remove('shiftLeft');
    ipcRenderer.send('exitSameWindowEditor', msg);
}

/**
 * Setup handling of the back, minimize, maximize, and close buttons. Naming of window buttons must match the ID
 * selectors at the top of this file.
 */
export function setupNavigationBar() {
    setupMCButtonEvents(backButton);
    backButton.textContent = "AI Connection";
    backButton.addEventListener('click', handleBackButton);

    setupMCButtonEvents(minButton);
    minButton.addEventListener('click', (event: MouseEvent) => {
        win.minimize();
    });
    win.on('unmaximize', onUnmaximized);

    setupMCButtonEvents(maxButton);
    maxButton.addEventListener('click', (event: MouseEvent) => {
        if (win.isMaximized()) {
            if (process.platform === "darwin") {
                win.setResizable(true);
                win.setMovable(true);
            }

            win.unmaximize();
        }
        else {
            maxButton.classList.add('isMaximized');
            // HACK: We can remove these 2 lines when we update to the electron version
            // that supports fullscreen that doesn't cover taskbar
            win.setMinimumSize(0,0);
            win.setResizable(true);
            win.maximize();
            // Mac os doesn't support unmaximize through mouse drag
            // so lock the movement of window
            if (process.platform === "darwin") {
                win.setResizable(false);
                win.setMovable(false);
            }
        }
    });

    setupMCButtonEvents(closeButton);
    closeButton.onclick = (ev: MouseEvent) => { exitDialog.ShowDialog(); };
}

function editorTransitionCallback() {
    const msg: messages.EditorWindowInfo = {
        splitView: true
    };

    isEditorLoaded = true;
    ipcRenderer.send('sameWindowEditorLoaded', msg);
    loadingLabel.classList.add('hidden');
    body.classList.add('hideBackground');
    headerBar.classList.remove('hidden');
    title.classList.add('absolute');
    window.setTimeout(() => {
        // Make editor appearance a bit smoother by giving the window some time to resize.
        editor.classList.remove('hide');
        minButton.classList.add('shiftLeft');
        maxButton.classList.remove('hidden');
    }, 300);

    if (editor[shouldOpenDevTools]) {
        editor.openDevTools();
    }
    // Don't call this twice, since if they click on a link this will be called again but we don't want to move the
    // window around
    editor.removeEventListener('did-finish-load', editorTransitionCallback);
}

function editorLoadErrorCallback() {
    // In case of load error, the did-finish-load event is still fired, so remove the handler
    editor.removeEventListener('did-finish-load', editorTransitionCallback);

    if (editorName) {
        locElement('editor.errorloading', loadingLabel);
        loadingLabel.textContent += ` ${editorName}. ${internetMsg.text}`;
    }
    else {
        locElement('editor.errorloadingeditor', loadingLabel);
        loadingLabel.textContent += ` ${internetMsg.text}`;
    }

    //even if element message was clean, we want to make sure we check the internetMsg
    let msgFont: string = locFont(internetMsg.text);
    if(msgFont != null) {
        loadingLabel.style.fontFamily = msgFont;
    }
}

export function setupEditorTransition(allowDevTools: boolean = false) {
    if (allowDevTools) {
        // If the current editor allows dev tools to be open, and the main process passed 'openDevTools=true' as a
        // querystring in the browser window URL, open the dev tools for the editor webview
        const parsedUrl = url.parse(window.location.href, true);
        const openDevTools = parsedUrl.query['openDevTools'];
        editor[shouldOpenDevTools] = openDevTools;
    }

    editor.addEventListener('did-finish-load', editorTransitionCallback);
    editor.addEventListener('did-fail-load', editorLoadErrorCallback);
}

export function allowAlternateStartPage() {
    ipcRenderer.on('openInWebview', (event: Electron.Event, url: string) => {
        editor.loadURL(url);
    });
}

// Setup ipc handlers that pass information between main and the 'editor' webview
export function setupIPCPipe() {
    // Set up Minecraft communication
    // 'ipc-message' is the built-in electron event for receiving messages from the guest page running inside the webview.
    // The guest page inside the webview can use ipcRenderer.sendToHost() to generate this event.
    editor.addEventListener('ipc-message', (event) => {
        if (event.channel === 'sendToApp') {
            // Forward messages from pxt-core to Minecraft.
            const minecraftMessage: any = event.args[0];
            minecraftApi.sendToMinecraft(JSON.stringify(minecraftMessage));
        }
        else {
            console.log(`Ignoring editor IPC message: ${event.channel}`);
        }
    });

    minecraftApi.setMinecraftListener((response: string) => {
        // Forward responses to the webview.
        editor.send('responseFromApp', response);
    });
}

export function setupIPCExternalLinks() {
    editor.addEventListener('ipc-message', (event) => {
        if (event.channel === 'openExternalLink') {
            console.log(`Opening external link ${event.args[0]}`);
            shell.openExternal(event.args[0]);
        }
    });
}

// Open any links in an external browser page.
function openInBrowser(event: Electron.NewWindowEvent | Electron.WillNavigateEvent): void {
    const currentUrl: url.Url = url.parse(editor.src);
    const newUrl: url.Url = url.parse(event.url)
    if (newUrl.host !== currentUrl.host) {
        console.log('Opening external URL: ' + event.url);
        event.preventDefault();
        shell.openExternal(event.url);
    }
}

export function openLinksExternally() {
    editor.addEventListener('new-window', openInBrowser);
    editor.addEventListener('will-navigate', openInBrowser);
}
