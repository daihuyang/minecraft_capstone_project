"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sharedConstants_1 = require("./sharedConstants");
const electron_1 = require("electron");
const uuid = require("uuid");
const companionApp_1 = require("./companionApp");
const electron_2 = require("electron");
const fs = require("fs");
class Telemetry {
    constructor() {
        this.maelstromHost = sharedConstants_1.IsProduction ? 'minecraftprod.rtep.msgamestudios.com' :
            'rtep.int.msgamestudios.com';
        this.maelstromPath = sharedConstants_1.IsProduction ? '/tenants/minecraftprod/routes/edu' :
            '/tenants/minecraftint/routes/test';
        this.maelstromContentType = 'application/ms-maelstrom.v3+json;type=eventbatch;charset=utf-8';
        this.appId = 2;
        this.sessionId = uuid.v4();
        this.sequenceId = 0;
        this.isEdu = true;
        this.logFile = null;
        this.pathWithSession = this.maelstromPath + '/' + this.sessionId;
        if (!sharedConstants_1.IsProduction) {
            fs.open(`${electron_1.app.getPath('appData')}/${electron_1.app.getName()}/telemetry_log.txt`, 'w', (err, fd) => {
                if (err == null) {
                    this.logFile = fd;
                }
            });
        }
    }
    closeLog() {
        if (this.logFile !== null) {
            fs.close(this.logFile, (err) => { });
        }
    }
    fireClosed(activeSeconds, callback) {
        this.fireProps('CompanionAppEnd', {
            'ActiveSeconds': Math.floor(activeSeconds)
        }, callback);
    }
    fireEditorButtonPressed(buttonType, url) {
        this.fireProps('EditorButtonPressed', {
            'ButtonType': buttonType,
            // == null is null or undefined, make it undefined so 'ButtonUrl' isn't written to the json
            'ButtonUrl': url == null ? undefined : encodeURI(url)
        }, null);
    }
    fireConnectionFailureEvent(clientProtocol, companionProtocol, commandError, connectionError) {
        //pass in 'versionMismatch" event name, along with client and app protocol numbers
        //firePropers takes care of build#, and ID data
        this.fireProps('ConnectionFailure', {
            'ClientProtocol': clientProtocol,
            'CompanionProtocol': companionProtocol,
            'CommandError': commandError,
            'ConnectionError': connectionError
        }, null);
    }
    fireProps(eventName, properties, callback) {
        // Tack on base properties
        properties['PlayerSessionID'] = this.playerSessionid;
        properties['ClientID'] = this.clientId;
        properties['UserID'] = this.userId;
        properties['IsEdu'] = this.isEdu;
        properties['Plat'] = process.platform.toString();
        properties['Build'] = sharedConstants_1.Build;
        properties['CompanionAppId'] = this.appId;
        this.fireBody({
            'EventName': eventName,
            'Properties': properties
        }, callback);
    }
    fireBody(body, callback) {
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
    fireObject(obj, callback) {
        let toFire = JSON.stringify(obj);
        // Electron takes any, but they almost exactly mirror node's RequestOptions
        let options = {
            'method': 'POST',
            'protocol': 'https:',
            'hostname': this.maelstromHost,
            'path': this.pathWithSession,
            'headers': {
                'Content-Type': this.maelstromContentType,
                'Content-Length': toFire.length
            }
        };
        // Use Electron.net instead of HTTPS so we properly pick up on system proxy settings
        let request = electron_2.net.request(options);
        request.on('error', (e) => {
            let message = `Error firing telemetry event: ${e}`;
            companionApp_1.getApp().debugLog(message);
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
        let now = new Date();
        // Output to match Minecraft's use of strftime(%Y-%m-%dT%X) which looks like 2017-02-11T00:59:34
        let year = now.getUTCFullYear().toString();
        let month = (now.getUTCMonth() + 1).toString();
        let day = now.getUTCDate().toString();
        let hour = now.getUTCHours().toString();
        let minute = now.getUTCMinutes().toString();
        let second = now.getUTCSeconds().toString();
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }
    // Exactly what minecraft does for consistency
    hashCode(s) {
        let len = s.length;
        let hash = 0;
        for (let i = 0; i < len; ++i) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
        }
        // Make hash unsigned
        hash = hash >>> 0;
        return hash;
    }
    round(num) {
        return Number(num.toFixed(2));
    }
    log(message) {
        if (this.logFile !== null) {
            fs.write(this.logFile, `${message}\n`, (err, written, str) => { });
        }
    }
}
exports.Telemetry = Telemetry;
//# sourceMappingURL=telemetry.js.map