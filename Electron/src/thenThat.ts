import * as hostedIDE from './hostedIDE';
import * as constants from './base/sharedConstants.js';
// is this import necessary?
import { CompanionApp, ICompanionListener, getApp, CommandLogType } from './base/companionApp';

// setting up app title
const title = document.getElementById('TitleText');
let editorName: string = "If This, Then That!";
document.title = constants.ApplicationName;
title.textContent = ` - ${editorName}`;
title.style.paddingLeft = "240px";

// this ensures our window can be exited / minimized
hostedIDE.setupNavigationBar();

// Need to pipe this into socketserver.ts or somehow connect the initialized CompanionApp
// should be able to subscribe tto events using the compaion app's commandGlue interface

// getApp().debugLog("Test");
// getApp().commandGlue.addEventSubscription('BlockPlaced', (response: any) => {
//     getApp().debugLog(response.body.eventName);
// });



