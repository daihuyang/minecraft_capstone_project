"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hostedIDE = require("./hostedIDE");
hostedIDE.setupEditorName('Microsoft MakeCode');
hostedIDE.setupEditorTransition(/*allowDevTools*/ true);
hostedIDE.setupNavigationBar();
hostedIDE.setupIPCPipe();
hostedIDE.openLinksExternally();
//# sourceMappingURL=pxt.js.map