import * as hostedIDE from './hostedIDE';

hostedIDE.setupEditorName('Microsoft MakeCode');
hostedIDE.setupEditorTransition(/*allowDevTools*/ true);
hostedIDE.setupNavigationBar();
hostedIDE.setupIPCPipe();
hostedIDE.openLinksExternally();
