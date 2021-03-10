"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hostedIDE = require("./hostedIDE");
const constants = require("./base/sharedConstants.js");
// setting up app title
const title = document.getElementById('TitleText');
let editorName = "If This, Then That!";
document.title = constants.ApplicationName;
title.textContent = ` - ${editorName}`;
title.style.paddingLeft = "240px";
// this ensures our window can be exited / minimized
hostedIDE.setupNavigationBar();
// Need to pipe this into socketserver.ts or somehow connect the initialized CompanionApp
// should be able to subscribe tto events using the compaion app's commandGlue interface
// consolelog will not print
// console.log("test");
// testing a change in element HTML
document.querySelector("#msg").innerHTML = "code compiled";
// code will compile, however console cannot be accessed since it is pat of the companion app
// cannot access the instance of the companionApp spawned by main.ts , but socketserver.ts can. Weird
// getApp() will cause code to not compile at all, weird
// getApp().debugLog("Test");
// getApp().commandGlue.addEventSubscription('BlockPlaced', (response: any) => {
//     getApp().debugLog(response.body.eventName);
// });
//# sourceMappingURL=thenThat.js.map