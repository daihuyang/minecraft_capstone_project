/// <reference path="../typings/index.d.ts" />
import { app, BrowserWindow, ipcMain } from 'electron';
import * as WS from './socketServer';
import { ICommandListener } from './socketServer';
import { CommandGlue } from './commandGlue';
import { CommandError, ErrorCode, ConnectionError } from './commandError';
import { Telemetry } from './telemetry'
import { Loc } from './loc';
import * as Msg from './debugMessage';
import { LocResult } from './LocData';

export interface ICompanionListener {
    onCommandResponse(response: any);
    onCommandError(error: CommandError);
    // Called the moment websocket connection is established
    onConnectionEstablished();
    // Called once commands are ready to be sent, meaning version checks, and maybe encryption
    onConnectionValidated(error: ConnectionError);
    onClosed();
    // Called when the websocket port has been bound and we're ready to accept connections
    onListening();
}

export enum CommandLogType { Running, Complete, Failed }

export class CompanionApp {
    messageTarget: WS.ICommandListener;
    win: Electron.BrowserWindow;
    debugWin: Electron.BrowserWindow;
    onViewLoad: () => void = null;
    wsPort: number = 19131;
    restPort: number = 8080;
    server: WS.SocketServer = null;
    commandGlue: CommandGlue = null;
    connectionInitializer: WS.ICommandListener = null;
    companionListener: ICompanionListener = null;
    telemetry: Telemetry = new Telemetry();
    loc: Loc;

    queuedLogs: Msg.DebugMessageBase[] = [];
    debugWindowReady: boolean = false;

    localize(key: string): string {
        return this.loc.get(key);
    }

    loadLanguage(language: string) {
        this.loc = new Loc(language);
    }

    getCommandGlue(): CommandGlue {
        return this.commandGlue;
    }

    getIPAddress(): string {
        return this.server.getIPAddress();
    }

    setIsEdu(isEdu: boolean) {
        this.telemetry.isEdu = isEdu;
    }

    getIsEdu(): boolean {
        return this.telemetry.isEdu;
    }

    hasValidatedConnection(): boolean {
        return this.server.isConnected() && this.messageTarget != this.connectionInitializer;
    }

    debugLog(message: string) {
        this.sendLog(new Msg.SimpleDebugMessage(message));
    }

    debugLogCommand(type: CommandLogType, command: string | Object) {
        let msg: Msg.CommandDebugMessageBase;
        let commandString: string;
        if (typeof command === "string") {
            commandString = command;
        } else {
            commandString = JSON.stringify(command);
        }
        switch (type) {
            case CommandLogType.Complete:
                msg = new Msg.CommandCompleteDebugMessage(commandString);
                break;
            case CommandLogType.Failed:
                msg = new Msg.CommandFailedDebugMessage(commandString);
                break;
            case CommandLogType.Running:
                msg = new Msg.RunningCommandDebugMessage(commandString);
                break;
        }
        this.sendLog(msg);
    }

    private sendLog(message: Msg.DebugMessageBase) {
        if (this.debugWin != null && this.debugWindowReady) {
            if (message instanceof Msg.CommandDebugMessageBase) {
                this.debugWin.webContents.send('logCommand', message.toString(), message.color);
            } else {
                this.debugWin.webContents.send('log', message.toString());
            }
        }
        else {
            this.queuedLogs.push(message);
        }
        console.log(message.toString());
    }

    createDebugWindow() {
        this.debugWin = new BrowserWindow({width: 800, height: 600});
        this.debugWin.setMenu(null);
        let self = this;
        this.debugWin.on('closed', () => {
            self.debugWin = null;
        });
        this.debugWin.webContents.on('did-finish-load', () => {
            this.debugWindowReady = true;
            for (let i = 0; i < this.queuedLogs.length; ++i) {
                this.sendLog(this.queuedLogs[i]);
            }
            this.queuedLogs = [];
        });
        this.debugWin.loadURL(`file://${__dirname}/debugView.html`);
    }

    closeDebugWindow() {
        if (this.debugWin) {
            this.debugWin.close();
        }
    }

    initCommandLayer(options: any = {}) {
        let init = options.connectionInitializer;
        let listener = options.companionListener;
        if (init != null) {
            this.setConnectionInitializer(init);
        }
        if (listener != null) {
            this.setCompanionListener(listener);
        }

        this.server = new WS.SocketServer(this.wsPort, new WS.ServerCallbacks(this.onConnected, this.onClosed, this.onError, this.onCommandResponse, this.onListening));
        this.commandGlue = new CommandGlue(this.server);
    }

    setConnectionInitializer(initializer: ICommandListener) {
        this.connectionInitializer = initializer;
    }

    setCompanionListener(listener: ICompanionListener) {
        //One should do, and if it really isn't enough, the attached listener can be responsible for passing the messages along
        this.companionListener = listener;
    }

    setRawSocketListener(callback: (message: string)=>void) {
        this.server.setRawListener(callback);
    }

    onListening() {
        if (getApp().companionListener != null) {
            getApp().companionListener.onListening();
        }
    }

    onConnectionComplete(error: ConnectionError) {
        switch (error) {
            case ConnectionError.None:
                this.commandGlue.onConnected();
                // Now socket server sends command response and error to the glue
                this.messageTarget = this.commandGlue;
                break;
            case ConnectionError.GetInfoError:
                this.debugLog('Error validating connection');
                break;
            case ConnectionError.ThisOutOfDate:
                this.debugLog('Please update this application to the latest version.');
                break;
            case ConnectionError.MinecraftOutOfDate:
                this.debugLog('Please update Minecraft: Education Edition to the latest version.');
                break;
        }
        if (this.companionListener) {
            this.companionListener.onConnectionValidated(error);
        }
    }

    onConnected() {
        let self = getApp();
        // Now socket server sends command response and error to the connection initializer
        self.messageTarget = self.connectionInitializer;
        if (self.connectionInitializer != null) {
            self.connectionInitializer.onConnected.call(self.connectionInitializer);
        }
        else {
            // If no initializer is given, skip it
            self.onConnectionComplete.call(self, ConnectionError.None);
        }
        // Do this last so that the callback could run commands if it wanted to
        if (self.companionListener) {
            self.companionListener.onConnectionEstablished();
        }
    }

    onClosed() {
        let self = getApp();
        self.commandGlue.onClosed();
        if (self.companionListener) {
            self.companionListener.onClosed();
        }
    }

    onError(error: CommandError, response: any) {
        let self = getApp();
        if (self.messageTarget != null) {
            self.messageTarget.onError(error, response);
        }
        if (self.companionListener) {
            self.companionListener.onCommandError(error);
        }
    }

    onCommandResponse(response: any) {
        let self = getApp();
        self.messageTarget.onCommandResponse(response);
        if (self.companionListener) {
            self.companionListener.onCommandResponse(response);
        }
    }

    getFont(text: string) {
        //use fallback font for specific languages that suffer from
        //character display errors when using default mojangles
        let changeFont = false;
        for(let i = 0; i < text.length; ++i) {
            let ascii = text.charCodeAt(i);
            if(ascii >= 256) {
                return "Fallback";
            }
        }
        return null;
    }
}

let companionApp: CompanionApp = new CompanionApp();

export function getApp() {
    return companionApp;
}

ipcMain.on('loc', (event: Electron.Event, key: string) => {
    let localized: string = getApp().localize(key);
    event.returnValue = new LocResult(localized, getApp().getFont(localized));
})

ipcMain.on('locFont', (event: Electron.Event, text: string) => {
    event.returnValue = getApp().getFont(text);
});