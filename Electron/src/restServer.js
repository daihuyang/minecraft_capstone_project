'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Express = require("express");
const companionApp_1 = require("./base/companionApp");
const targetParser_1 = require("./base/targetParser");
const blockPosParser_1 = require("./base/blockPosParser");
const optionalParser_1 = require("./base/optionalParser");
const rotationParser_1 = require("./base/rotationParser");
const numParser_1 = require("./base/numParser");
const commandError_1 = require("./base/commandError");
exports.RestServer = Express();
//-------------------------------------------------------------------------------------------------------------------
// REST interface. Each call requires a connection id (cid) and REST key (rk) which is provided when you connect to the websocket server.
//-------------------------------------------------------------------------------------------------------------------
function runURLCommand(myURL, query, res) {
    switch (myURL) {
        case '/move':
            runCommand('agent move', [query.direction], res);
            break;
        case '/turn':
            runCommand('agent turn', [query.direction], res);
            break;
        case '/place':
            runCommand('agent place', [new numParser_1.Num(query.slotNum), query.direction], res);
            break;
        case '/attack':
            runCommand('agent attack', [query.direction], res);
            break;
        case '/destroy':
            runCommand('agent destroy', [query.direction], res);
            break;
        case '/till':
            runCommand('agent till', [query.direction], res);
            break;
        case '/collect':
            runCommand('agent collect', [query.item], res);
            break;
        case '/drop':
            runCommand('agent drop', [new numParser_1.Num(query.slotNum), new numParser_1.Num(query.quantity), query.direction], res);
            break;
        case '/dropall':
            runCommand('agent dropall', [query.direction], res);
            break;
        case '/detect':
            runCommand('agent detect', [query.direction], res);
            break;
        case '/inspect':
            runCommand('agent inspect', [query.direction], res);
            break;
        case '/inspectdata':
            runCommand('agent inspectdata', [query.direction], res);
            break;
        case '/detectredstone':
            runCommand('agent detectredstone', [query.direction], res);
            break;
        case '/activateredstone':
            runCommand('agent activateredstone', [query.type, query.direction], res);
            break;
        case '/getitemdetail':
            runCommand('agent getitemdetail', [new numParser_1.Num(query.slotNum)], res);
            break;
        case '/getitemspace':
            runCommand('agent getitemspace', [new numParser_1.Num(query.slotNum)], res);
            break;
        case '/getitemcount':
            runCommand('agent getitemcount', [new numParser_1.Num(query.slotNum)], res);
            break;
        case '/transfer':
            runCommand('agent transfer', [new numParser_1.Num(query.srcSlotNum), new numParser_1.Num(query.quantity), new numParser_1.Num(query.dstSlotNum)], res);
            break;
        case '/tptoplayer':
            runCommand('agent tp', [], res, true);
            break;
        case '/tptargettotarget':
            runCommand('tp', [new targetParser_1.Target(query.victim), new targetParser_1.Target(query.destination)], res, true, 2);
            break;
        case '/tptargettopos':
            runCommand('tp', [new targetParser_1.Target(query.victim), new blockPosParser_1.BlockPos(query.destination),
                new optionalParser_1.Optional(new rotationParser_1.Rotation(query.yrot)), new optionalParser_1.Optional(new rotationParser_1.Rotation(query.xrot))], res, true, 2);
            break;
        case '/weather':
            runCommand('weather', [query.type, new optionalParser_1.Optional(new numParser_1.Num(query.duration))], res, true);
            break;
        case '/executedetect':
            runCommand('execute', [new targetParser_1.Target(query.origin), new blockPosParser_1.BlockPos(query.position), 'detect', new blockPosParser_1.BlockPos(query.detectPos), query.detectBlock, new numParser_1.Num(query.detectData), query.command], res, true);
            break;
        case '/executeasother':
            runCommand('execute', [new targetParser_1.Target(query.origin), new blockPosParser_1.BlockPos(query.position), query.command], res, true);
            break;
        case '/kill':
            runCommand('kill', [new optionalParser_1.Optional(new targetParser_1.Target(query.target))], res, true);
            break;
        case '/fill':
            runCommand('fill', [new blockPosParser_1.BlockPos(query.from), new blockPosParser_1.BlockPos(query.to), query.tileName,
                new optionalParser_1.Optional(new numParser_1.Num(query.tileData)), new optionalParser_1.Optional(query.oldBlockHandling),
                new optionalParser_1.Optional(query.replaceTileName), new optionalParser_1.Optional(new numParser_1.Num(query.replaceDataValue))], res, true);
            break;
        case '/give':
            runCommand('give', [new targetParser_1.Target(query.player), query.itemName, new optionalParser_1.Optional(new numParser_1.Num(query.amount)), new optionalParser_1.Optional(new numParser_1.Num(query.data))], res, true);
            break;
        case '/timesetbynumber':
            runCommand('time set', [new numParser_1.Num(query.time)], res, true);
            break;
        case '/timesetbyname':
            runCommand('time set', [query.time], res, true);
            break;
        case '/setblock':
            runCommand('setblock', [new blockPosParser_1.BlockPos(query.position), query.tileName, new optionalParser_1.Optional(new numParser_1.Num(query.tileData)), new optionalParser_1.Optional(query.oldBlockHandling)], res, true);
            break;
        case '/testforblock':
            runCommand('testforblock', [new blockPosParser_1.BlockPos(query.position), query.tileName, new optionalParser_1.Optional(new numParser_1.Num(query.dataValue))], res, true);
            break;
        case '/testforblocks':
            runCommand('testforblocks', [new blockPosParser_1.BlockPos(query.begin), new blockPosParser_1.BlockPos(query.end), new blockPosParser_1.BlockPos(query.destination), new optionalParser_1.Optional(query.mode)], res, true);
            break;
        case '/summon':
            runCommand('summon', [query.entityType, new blockPosParser_1.BlockPos(query.spawnPos)], res, true);
            break;
        case '/clone':
            runCommand('clone', [new blockPosParser_1.BlockPos(query.begin), new blockPosParser_1.BlockPos(query.end), new blockPosParser_1.BlockPos(query.destination),
                new optionalParser_1.Optional(query.maskMode), new optionalParser_1.Optional(query.cloneMode), new optionalParser_1.Optional(query.tileName), new optionalParser_1.Optional(new numParser_1.Num(query.tileData))], res, true);
            break;
    }
}
exports.runURLCommand = runURLCommand;
function registerCmd(name) {
    exports.RestServer.get(name, function (req, res) {
        runURLCommand(name, req.query, (response) => {
            res.send(JSON.stringify(response));
        });
    });
}
function restListenOn(port, errorCallback) {
    let server = exports.RestServer.listen(port, function () {
        companionApp_1.getApp().debugLog(`REST server listening at ${companionApp_1.getApp().getIPAddress()}:${port}`);
    });
    server.on('error', (err) => {
        let ce = new commandError_1.CommandError(commandError_1.ErrorCode.FailedToBind);
        ce.errorMessage += ' ' + String(port);
        errorCallback(ce);
    });
    let glue = companionApp_1.getApp().commandGlue;
    glue.addEventSubscription('AgentCommand', (response) => {
        companionApp_1.getApp().debugLog('Agent Response');
        // Strip out all the unrelated stuff and only return relevant subset
        if (response.body == undefined || response.body.properties == undefined || response.body.properties.Result == undefined) {
            companionApp_1.getApp().debugLog('Missing result field in Agent Event response');
            onCommandResponse(new commandError_1.CommandError(commandError_1.ErrorCode.FailedToParseCommandResponse), null);
        }
        else if (currCallback != null) {
            curResponseSend(JSON.parse(response.body.properties.Result));
        }
        // Can happen if the user cancelled execution of a command by quickly executing another
        else {
            companionApp_1.getApp().debugLog('Received unexpected Agent response');
        }
    });
    glue.addCloseSubscription(() => {
        if (currCallback != null) {
            onCommandResponse(new commandError_1.CommandError(commandError_1.ErrorCode.NoConnection), null);
        }
    });
}
exports.restListenOn = restListenOn;
exports.RestServer.all('/*', function (req, res, next) {
    // Allow cross domain communication with anyone. None of our messages contain sensitive information
    res.header('Access-Control-Allow-Origin', req.headers['origin']);
    // ajax call only
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});
exports.RestServer.get('/connected', function (req, res) {
    res.json(companionApp_1.getApp().getCommandGlue().server.isConnected());
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
exports.RestServer.use(function (req, res) {
    let ce = new commandError_1.CommandError(commandError_1.ErrorCode.InvalidURL);
    ce.errorMessage += req.url;
    curResponseSend(JSON.stringify(ce));
});
// Command glue isn't bound to one command at a time, but this interface wants to be, so it's tracked here
let currCallback = null;
let isCurCommandInstant = false;
function runCommand(commandName, commandInput, response, isInstant = false, version = 1) {
    // This shouldn't happen during normal execution of a single program, but it can if the user abruptly restarts it 
    if (currCallback != null) {
        let ce = new commandError_1.CommandError(commandError_1.ErrorCode.CancelledCommand);
        curResponseSend(ce);
    }
    currCallback = response;
    isCurCommandInstant = isInstant;
    companionApp_1.getApp().getCommandGlue().runCommand(commandName, commandInput, onCommandResponse, version);
}
// One will be null: commandError if sucess, else response
function onCommandResponse(commandError, response) {
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
function curResponseSend(response) {
    if (currCallback != null) {
        currCallback(response);
        clearCommand();
    }
}
//# sourceMappingURL=restServer.js.map