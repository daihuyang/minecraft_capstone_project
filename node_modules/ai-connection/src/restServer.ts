'use strict';

import * as Express from 'express';
import { CommandGlue } from './base/commandGlue';
import { getApp } from './base/companionApp';
import { Target } from './base/targetParser';
import { BlockPos } from './base/blockPosParser';
import { Optional } from './base/optionalParser';
import { Rotation } from './base/rotationParser';
import { Num } from './base/numParser';
import { CommandError, ErrorCode } from './base/commandError';
export const RestServer = Express();

//-------------------------------------------------------------------------------------------------------------------
// REST interface. Each call requires a connection id (cid) and REST key (rk) which is provided when you connect to the websocket server.
//-------------------------------------------------------------------------------------------------------------------

export function runURLCommand(myURL: string, query: any, res: (response: any) => void) {
        switch(myURL) {

            case '/move'            : runCommand('agent move', [query.direction], res);
                                    break;

            case '/turn'            : runCommand('agent turn', [query.direction], res);
                                    break;

            case '/place'           : runCommand('agent place', [new Num(query.slotNum), query.direction], res);
                                    break;

            case '/attack'          : runCommand('agent attack', [query.direction], res);
                                    break;

            case '/destroy'         : runCommand('agent destroy', [query.direction], res);
                                    break;

            case '/till'            : runCommand('agent till', [query.direction], res);
                                    break;
            
            case '/collect'         : runCommand('agent collect', [query.item], res);
                                    break;
            
            case '/drop'            : runCommand('agent drop', [new Num(query.slotNum), new Num(query.quantity), query.direction], res);
                                    break;

            case '/dropall'         : runCommand('agent dropall', [query.direction], res);
                                    break;

            case '/detect'          : runCommand('agent detect', [query.direction], res);
                                    break;

            case '/inspect'         : runCommand('agent inspect', [query.direction], res);
                                    break;

            case '/inspectdata'     : runCommand('agent inspectdata', [query.direction], res);
                                    break;

            case '/detectredstone'  : runCommand('agent detectredstone', [query.direction], res);
                                    break;

            case '/activateredstone': runCommand('agent activateredstone', [query.type, query.direction], res);
                                    break;

            case '/getitemdetail'   : runCommand('agent getitemdetail', [new Num(query.slotNum)], res);
                                    break;

            case '/getitemspace'    : runCommand('agent getitemspace', [new Num(query.slotNum)], res);
                                    break;

            case '/getitemcount'    : runCommand('agent getitemcount', [new Num(query.slotNum)], res);
                                    break;

            case '/transfer'        : runCommand('agent transfer', [new Num(query.srcSlotNum), new Num(query.quantity), new Num(query.dstSlotNum)], res);
                                    break;

            case '/tptoplayer'      : runCommand('agent tp', [], res, true);
                                    break;

            case '/tptargettotarget': runCommand('tp', [new Target(query.victim), new Target(query.destination)], res, true, 2); 
                                    break;

            case '/tptargettopos'   : runCommand('tp', [new Target(query.victim), new BlockPos(query.destination),
                                    new Optional(new Rotation(query.yrot)), new Optional(new Rotation(query.xrot))], res, true, 2);
                                    break;
            
            case '/weather'         : runCommand('weather', [query.type, new Optional(new Num(query.duration))], res, true);
                                    break;

            case '/executedetect'  : runCommand('execute', [new Target(query.origin), new BlockPos(query.position), 'detect', new BlockPos(query.detectPos), query.detectBlock, new Num(query.detectData), query.command], res, true);
                                    break;

            case '/executeasother' : runCommand('execute', [new Target(query.origin), new BlockPos(query.position), query.command], res, true);
                                    break;

            case '/kill'            : runCommand('kill', [new Optional(new Target(query.target))], res, true);
                                    break;

            case '/fill'            : runCommand('fill', [new BlockPos(query.from), new BlockPos(query.to), query.tileName,
                                      new Optional(new Num(query.tileData)), new Optional(query.oldBlockHandling),
                                      new Optional(query.replaceTileName), new Optional(new Num(query.replaceDataValue))], res, true);
                                    break;

            case '/give'            : runCommand('give', [new Target(query.player), query.itemName, new Optional(new Num(query.amount)), new Optional(new Num(query.data))], res, true);
                                    break;

            case '/timesetbynumber' : runCommand('time set', [new Num(query.time)], res, true);
                                    break;

            case '/timesetbyname'   : runCommand('time set', [query.time], res, true);
                                    break;

            case '/setblock'        : runCommand('setblock', [new BlockPos(query.position), query.tileName, new Optional(new Num(query.tileData)), new Optional(query.oldBlockHandling)], res, true);
                                    break;

            case '/testforblock'    : runCommand('testforblock', [new BlockPos(query.position), query.tileName, new Optional(new Num(query.dataValue))], res, true);
                                    break;

            case '/testforblocks'   : runCommand('testforblocks', [new BlockPos(query.begin), new BlockPos(query.end), new BlockPos(query.destination), new Optional(query.mode)], res, true);
                                    break;

            case '/summon'          : runCommand('summon', [query.entityType, new BlockPos(query.spawnPos)], res, true);
                                    break;

            case '/clone'           : runCommand('clone', [new BlockPos(query.begin), new BlockPos(query.end), new BlockPos(query.destination),
                                      new Optional(query.maskMode), new Optional(query.cloneMode), new Optional(query.tileName), new Optional(new Num(query.tileData))], res, true);
                                    break;
        }
}

function registerCmd(name: string) {
    RestServer.get(name, function (req, res) {
        runURLCommand(name, req.query, (response: any) => {
            res.send(JSON.stringify(response));
        });
    });
}

export function restListenOn(port: number, errorCallback: (error: CommandError) => void) {
    let server = RestServer.listen(port, function () {
        getApp().debugLog(`REST server listening at ${getApp().getIPAddress()}:${port}`)
    });
    server.on('error', (err: Error) => {
        let ce: CommandError = new CommandError(ErrorCode.FailedToBind);
        ce.errorMessage += ' ' + String(port);
        errorCallback(ce);
    });

    let glue: CommandGlue = getApp().commandGlue;
    glue.addEventSubscription('AgentCommand', (response: any) => {
        getApp().debugLog('Agent Response');
        // Strip out all the unrelated stuff and only return relevant subset
        if (response.body == undefined || response.body.properties == undefined || response.body.properties.Result == undefined) {
            getApp().debugLog('Missing result field in Agent Event response');
            onCommandResponse(new CommandError(ErrorCode.FailedToParseCommandResponse), null);
        }
        else if (currCallback != null) {
            curResponseSend(JSON.parse(response.body.properties.Result));
        }
        // Can happen if the user cancelled execution of a command by quickly executing another
        else {
            getApp().debugLog('Received unexpected Agent response');
        }
    });

    glue.addCloseSubscription(() => {
        if(currCallback != null) {
            onCommandResponse(new CommandError(ErrorCode.NoConnection), null);
        }
    });
}

RestServer.all('/*', function (req, res, next) {
    // Allow cross domain communication with anyone. None of our messages contain sensitive information
    res.header('Access-Control-Allow-Origin', req.headers['origin']);

    // ajax call only
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

RestServer.get('/connected', function (req, res) {
    res.json(getApp().getCommandGlue().server.isConnected());
});

registerCmd('/move');
registerCmd('/turn');
registerCmd('/place');
registerCmd('/attack');
registerCmd('/destroy');
registerCmd('/till');
registerCmd('/collect');
registerCmd('/drop');
registerCmd('/dropall');
registerCmd('/detect');
registerCmd('/inspect');
registerCmd('/inspectdata');
registerCmd('/detectredstone');
registerCmd('/activateredstone');
registerCmd('/getitemdetail');
registerCmd('/getitemspace');
registerCmd('/getitemcount');
registerCmd('/transfer');
registerCmd('/tptoplayer');
registerCmd('/tptargettotarget');
registerCmd('/tptargettopos');
registerCmd('/weather');
registerCmd('/executedetect');
registerCmd('/executeasother');
registerCmd('/kill');
registerCmd('/fill');
registerCmd('/give');
registerCmd('/timesbynumber');
registerCmd('/timesetbyname');
registerCmd('/setblock');
registerCmd('/testforblock');
registerCmd('/testforblocks');
registerCmd('/summon');
registerCmd('/clone');

RestServer.use(function (req, res) {
    let ce = new CommandError(ErrorCode.InvalidURL);
    ce.errorMessage += req.url;
    curResponseSend(JSON.stringify(ce));
});

// Command glue isn't bound to one command at a time, but this interface wants to be, so it's tracked here
let currCallback : (response : any)  => void = null;
let isCurCommandInstant: boolean = false;

function runCommand(commandName: string, commandInput: any[], response: (res : any)  => void, isInstant: boolean = false, version: number = 1) {
    // This shouldn't happen during normal execution of a single program, but it can if the user abruptly restarts it 
    if (currCallback != null) {
        let ce: CommandError = new CommandError(ErrorCode.CancelledCommand);
        curResponseSend(ce);
    }
    currCallback = response;
    isCurCommandInstant = isInstant;
    getApp().getCommandGlue().runCommand(commandName, commandInput, onCommandResponse, version);
}

// One will be null: commandError if sucess, else response
function onCommandResponse(commandError: CommandError, response: any) {
    if (commandError != null) {
        curResponseSend(commandError);
    }
    else {
        // If we don't expect an event for this type of command, it's done now
        if (isCurCommandInstant) {
            // We don't care about these fields for the REST response, so get rid of them
            response.body.statusCode = undefined;
            response.body.statusMessage = undefined;
            // For instant commands (Non-agent), response result is in body
            curResponseSend(response.body);
        }
    }
}

function clearCommand() {
    currCallback = null;
}

function curResponseSend(response: any) {
    if (currCallback != null) {
        currCallback(response);
        clearCommand();
    }
}
