import { IsProduction, Build, ApplicationName } from './sharedConstants';
import { app } from 'electron';
import * as uuid from 'uuid';
import * as HTTPS from 'https';
import { getApp } from './companionApp';
import { net } from 'electron'
import * as fs from 'fs';
import * as Error from './commandError';

export class Telemetry {
    readonly maelstromHost: string = IsProduction ? 'minecraftprod.rtep.msgamestudios.com' :
        'rtep.int.msgamestudios.com';
    readonly maelstromPath: string = IsProduction ? '/tenants/minecraftprod/routes/edu' :
        '/tenants/minecraftint/routes/test';
    readonly maelstromContentType: string = 'application/ms-maelstrom.v3+json;type=eventbatch;charset=utf-8';
    readonly appId: number = 2;

    sessionId: string = uuid.v4();
    sequenceId: number = 0;
    pathWithSession: string;
    // These two used to tie our events to the client we're connected to
    clientId: string;
    playerSessionid: string;
    isEdu: boolean = true;
    userId: string;
    logFile: number = null;

    constructor() {
        this.pathWithSession = this.maelstromPath + '/' + this.sessionId;
        if (!IsProduction) {
            fs.open(`${app.getPath('appData')}/${app.getName()}/telemetry_log.txt`, 'w', (err: NodeJS.ErrnoException, fd: number) => {
              if (err == null) {
                  this.logFile = fd;
              }
            });
        }
    }

    closeLog() {
        if (this.logFile !== null) {
            fs.close(this.logFile, (err)=>{});
        }
    }

    fireClosed(activeSeconds: number, callback: ()=>void) {
        this.fireProps('CompanionAppEnd', {
            'ActiveSeconds': Math.floor(activeSeconds)
        }, callback);
    }

    fireEditorButtonPressed(buttonType: string, url: string) {
        this.fireProps('EditorButtonPressed', {
            'ButtonType': buttonType,
            // == null is null or undefined, make it undefined so 'ButtonUrl' isn't written to the json
            'ButtonUrl': url == null ? undefined : encodeURI(url)
        }, null);
    }

    fireConnectionFailureEvent(clientProtocol: number, companionProtocol: number, commandError: Error.ErrorCode, connectionError: Error.ConnectionError) {
        //pass in 'versionMismatch" event name, along with client and app protocol numbers
        //firePropers takes care of build#, and ID data
        this.fireProps('ConnectionFailure', {
            'ClientProtocol': clientProtocol,
            'CompanionProtocol': companionProtocol,
            'CommandError': commandError as number,
            'ConnectionError': connectionError as number
            
        }, null);
    }
    
    fireProps(eventName: string, properties: any, callback: ()=>void) {
        // Tack on base properties
        properties['PlayerSessionID'] = this.playerSessionid;
        properties['ClientID'] = this.clientId;
        properties['UserID'] = this.userId;
        properties['IsEdu'] = this.isEdu;
        properties['Plat'] = process.platform.toString();
        properties['Build'] = Build;
        properties['CompanionAppId'] = this.appId;
        this.fireBody({
            'EventName': eventName,
            'Properties': properties
        }, callback);
    }

    fireBody(body: any, callback: ()=>void) {
        this.fireObject({
            'events': [{
                'body': body,
                'sequenceId': this.sequenceId,
                'timestampUtc': this.getTimestamp(),
                'typeId': this.hashCode(body.EventName)
            }]
        }, callback);
        this.sequenceId++;
    }

    fireObject(obj: any, callback: ()=>void) {
        let toFire: string = JSON.stringify(obj);

        // Electron takes any, but they almost exactly mirror node's RequestOptions
        let options: HTTPS.RequestOptions = {
            'method': 'POST',
            'protocol': 'https:',
            'hostname': this.maelstromHost,
            'path': this.pathWithSession,
            'headers': {
                'Content-Type': this.maelstromContentType,
                'Content-Length': toFire.length
            }
        }

        // Use Electron.net instead of HTTPS so we properly pick up on system proxy settings
        let request: Electron.ClientRequest = net.request(options);

        request.on('error', (e) => {
            let message: string = `Error firing telemetry event: ${e}`;
            getApp().debugLog(message);
            this.log(message);
            if (callback) {
                callback();
            }
        });
        request.write(toFire);
        request.on('finish', () => {
            this.log(toFire);
            if (callback != null) {
                callback();
            }
        });
        request.end();
    }

    getTimestamp() {
        let now: Date = new Date();
        // Output to match Minecraft's use of strftime(%Y-%m-%dT%X) which looks like 2017-02-11T00:59:34
        let year: string = now.getUTCFullYear().toString();
        let month: string = (now.getUTCMonth() + 1).toString();
        let day: string = now.getUTCDate().toString();
        let hour: string = now.getUTCHours().toString();
        let minute: string = now.getUTCMinutes().toString();
        let second: string = now.getUTCSeconds().toString(); 
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    // Exactly what minecraft does for consistency
    hashCode(s: string): number {
        let len: number = s.length;
        let hash: number = 0;

        for(let i = 0; i < len; ++i) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
        }
        // Make hash unsigned
        hash = hash >>> 0;
        return hash;
    }

    round(num: number): number {
        return Number(num.toFixed(2));
    }

    log(message: string) {
        if (this.logFile !== null) {
            fs.write(this.logFile, `${message}\n`, (err, written, str)=>{});
        }
    }
}