/// <reference path="typings/index.d.ts" />

let startupTime = process.hrtime();

import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { RestServer, restListenOn, runURLCommand } from './restServer';
import { CommandGlue } from './base/commandGlue';
import { ConnectionInitializer } from './connectionInitializer';
import { CommandError, ErrorCode, ConnectionError } from './base/commandError';
import { CompanionApp, ICompanionListener, getApp, CommandLogType } from './base/companionApp';
import * as url from 'url';
import * as messages from './messages';
import { ConnectedViewController } from './connectedViewController';
import { IsProduction, ShowDebugWindow } from './base/sharedConstants';
import { ErrorViewInfo } from './errorViewInfo';
import { setDefaultAppMenu } from './DefaultAppMenu'

// Dimension constants
const defaultViewWidth = 905;
const defaultViewHeight = 532;
const editorWidth = 800;
const editorMinWidth = 500;
const editorHeight = 600;
const editorMinHeight = 500;
const splitViewMinWidth = 1024;

// The base uri that will launch this application
const launchURI: string = 'codeconnection';
const minecraftURI: string = 'minecraftedu://?wsserver=ws://localhost:';

// Command-line option to open dev tools for browser windows and hosted webviews
const openDevTools: boolean = process.argv.indexOf('--devtools') > -1;

let win: Electron.BrowserWindow;
let onViewLoad: () => void = null;
let restServer = RestServer;
let restPort: number = 8080;
let wasURILaunched: boolean = false;
let timeCreatedMS: number = Date.now();
let connectedViewController: ConnectedViewController;

function setURILaunched() {
    getApp().debugLog('Was launched via URI');
    wasURILaunched = true;
}

export function getWindow(): Electron.BrowserWindow {
    return win;
}

export function getShouldOpenDevTools(): boolean {
    return openDevTools;
}

function gotoWaitingView() {
    gotoView('waitingView.html', () => {
        win.webContents.send('setCommandString', `/connect ${getApp().server.getIPAddress()}:${getApp().wsPort}`);
    });
}

function gotoErrorView(errorMessage: string, showLink: boolean, showBack: boolean) {
    gotoView('errorView.html', () => {
        win.webContents.send('setError', new ErrorViewInfo(errorMessage, showBack, showLink));
    });
}

export function gotoView(filename, loadedCallback: ()=>void) {
    setDefaultWindow();
    gotoURL('file://' + __dirname + '/' + filename, loadedCallback);
}

export function gotoURL(url: string, loadedCallback: ()=>void) {
    win.loadURL(url);
    onViewLoad = loadedCallback;
}

function setDefaultWindow() {
    win.setResizable(false);

    if (win.isMaximized()) {
        win.unmaximize();
    }

    win.setSize(defaultViewWidth, defaultViewHeight);
}

function setEditorWindow(splitView: boolean = false) {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    if (splitView && width >= splitViewMinWidth) {
        win.setPosition(0, 0);
        win.setSize(Math.floor(width / 2), height, true);
    }
    else {
        win.center();
        win.setSize(editorWidth, editorHeight, true);
    }

    win.setMinimumSize(editorMinWidth, editorMinHeight);
    win.setResizable(true);
}

function invokeMinecraftURI() {
    // Only interested in this URI if Minecraft opened us via URI
    if (wasURILaunched === true) {
        getApp().debugLog('Invoking minecraft URI...');
        shell.openExternal(minecraftURI + getApp().wsPort.toString());
    }
}

class CodeConnection implements ICompanionListener {
    onCommandResponse(response: any) {
    }

    onCommandError(error: CommandError) {
        if (error.errorCode == ErrorCode.FailedToBind) {
            gotoErrorView(`${error.errorMessage}. ${getApp().localize('error.issingleinstance')}`, false, true);
        }
    }

    onConnectionEstablished() {
    }

    onListening() {
        invokeMinecraftURI();
    }

    onConnectionValidated(error: ConnectionError) {
        switch (error) {
            case ConnectionError.None:
                connectedViewController.init();
                break;
            case ConnectionError.CreateAgentError:
            case ConnectionError.GetInfoError:
                getApp().debugLog('Error validating connection');
                gotoErrorView(getApp().localize('error.unknown'), true, true);
                break;
            case ConnectionError.ThisOutOfDate:
                gotoErrorView(getApp().localize('error.updatethis'), true, true);
                break;
            case ConnectionError.MinecraftOutOfDate:
                gotoErrorView(getApp().localize('error.updateminecraft'), true, true);
                break;
        }
        // Now that connection is established, bring window to foreground
        if (win != null) {
            win.restore();
            win.focus();
        }
    }

    onClosed() {
        gotoWaitingView();
    }
}

let cc: CodeConnection;

function restBindError(error: CommandError) {
    if (error.errorCode == ErrorCode.FailedToBind) {
        gotoErrorView(`${error.errorMessage}. ${getApp().localize('error.issingleinstance')}`, false, false);
    }
}

export function createBrowserWindow(url: string, splitView: boolean = false): Electron.BrowserWindow {
    let result: Electron.BrowserWindow;
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    if (splitView && width >= splitViewMinWidth) {
        result = new BrowserWindow({
            center: false,
            height,
            width: Math.floor(width / 2),
            x: 0,
            y: 0
        });
    }
    else {
        result = new BrowserWindow({ width: editorWidth, height: editorHeight });
    }
    result.setMenu(null);
    result.loadURL(url);
    result.webContents.on("did-stop-loading", function () {
        if (openDevTools) {
            result.webContents.openDevTools();
        }
    });
    return result;
}

function onStart() {
    // getLocale must be called after 'ready' event
    require('os-locale')().then((locale)=> {
        getApp().loadLanguage(locale);
        createWindow();
    });
}

function createWindow() {
    setDefaultAppMenu();
     // Create this after langauge is loaded since it uses localization
    connectedViewController = new ConnectedViewController();

    // Create debug window first so it's under the main one
    if (!IsProduction && ShowDebugWindow) {
        getApp().createDebugWindow();
    }

    win = new BrowserWindow({width: defaultViewWidth, height: defaultViewHeight, resizable: false, frame: false})
    // Disable file, edit, etc. menu
    win.setMenu(null);

    gotoWaitingView();

    win.webContents.on('did-finish-load', (event, args) => {
        if (onViewLoad != null) {
            onViewLoad();
        }

        if (openDevTools) {
            win.webContents.openDevTools({mode: 'detach'});
            const hrtimeDiff = process.hrtime(startupTime);
            const secondsDiff = hrtimeDiff[0] + hrtimeDiff[1] / 1e9;
            const perfMsg = `console.log("Total time to display window from app launch: ${secondsDiff}");`;
            win.webContents.executeJavaScript(perfMsg);
        }
    });

    win.on("closed", () => {
        win = null;
    });

    cc = new CodeConnection();
    getApp().initCommandLayer({ companionListener: cc, connectionInitializer: new ConnectionInitializer() });
    // When player leaves level, disconnect
    getApp().commandGlue.addEventSubscription('MultiplayerRoundEnd', (response: any) => {
        getApp().debugLog('User left level, aborting connection');
        getApp().server.closeConnection();
    });
    restListenOn(restPort, restBindError);
}

// Needs to be before ready, as this is emitted early
app.on('open-url', (event: Electron.Event, url: any) => {
    if (url != null && url.includes(launchURI)) {
        setURILaunched();
        // If we already created our window we can do this now, otherwise wait until window creation and invocation will happen then
        if (win != null) {
            invokeMinecraftURI();
        }
    }
});

app.on("ready", onStart);

app.on("window-all-closed", () => {
    let timeClosedMS = Date.now();
    let msToSeconds = 1/1000;
    // Make sure we finish sending the telemetry before quitting. Out of luck for force quit I guess
    getApp().telemetry.fireClosed((timeClosedMS - timeCreatedMS)*msToSeconds, () => {
        getApp().telemetry.closeLog();
        app.quit();
    });
});

app.on("activate", () => {
    if (win === null) onStart();
});

if (!app.isDefaultProtocolClient(launchURI)) {
    // Point at electron and supply main.js file. Works both for packaged and vscode builds
    app.setAsDefaultProtocolClient(launchURI, app.getPath('exe'), [__dirname + '/main.js']);
}

// On windows, the URI that invoked this is provided here. On mac you need to catch it through open-url
// argv is pretty inconsistent, so search through all of them for uri
for (let k in process.argv) {
    // String, but typescript doesn't know about includes
    let arg = process.argv[k];
    if (arg != null && arg.includes(launchURI)) {
        setURILaunched();
        break;
    }
}

// Enfore single instance
let isSecondaryInstance: boolean = app.makeSingleInstance(() => {
    win.restore();
    win.focus();
});

if (isSecondaryInstance) {
    // If minecraft launched a second instance, they want to connect, so close this secondary one, but tell Minecraft there's an instance that can connect, which is the other one
    invokeMinecraftURI();
    app.quit();
}

ipcMain.on('exit', (args) => {
    if (win != null) {
        win.close();
    }
    // We don't want debug window to keep the program alive
    getApp().closeDebugWindow();
});

ipcMain.on('minimize', (args) => {
    if (win != null) {
        win.minimize();
    }
});

function sendToWindow(message: string) {
    if (win && connectedViewController.getIsHostingEditor()) {
        win.webContents.send('responseFromMinecraft', message);
    }
    else {
        // If window is gone, also get rid of listener
        getApp().setRawSocketListener(null);
    }
}

ipcMain.on('sendToMinecraft', (event: Electron.Event, command: string) => {    
    let parsed = JSON.parse(command);
    if (parsed.api == "basic") {
        let myURL: url.Url = url.parse(parsed.url, true);
        runURLCommand(myURL.pathname, myURL.query, (response: any) => {
            response.api = 'basic';
            sendToWindow(JSON.stringify(response));
        });
        getApp().debugLogCommand(CommandLogType.Running, command);
    }
    //if api != basic, we're not using code.org so just continue like normal for tynker/make code
    else {
        getApp().debugLogCommand(CommandLogType.Running, command);
        getApp().server.sendText(command);
    }
});

ipcMain.on('setRawListening', (event: Electron.Event, shouldListen: boolean) => {
    getApp().setRawSocketListener(shouldListen ? (message: string) => {
        sendToWindow(message);
    } : null);
});

ipcMain.on('exitSameWindowEditor', (event: Electron.Event, params: messages.ExitEditorMessage) => {
    getApp().setRawSocketListener(null);
    connectedViewController.init();

    if (params.isEditorLoaded) {
        win.center();
    }
});

ipcMain.on('sameWindowEditorLoaded', (event: Electron.Event, params: messages.EditorWindowInfo) => {
    setEditorWindow(params.splitView);
});

ipcMain.on('backFromError', (event: Electron.Event) => {
    gotoWaitingView();
});