import * as hostedIDE from './hostedIDE';

hostedIDE.setupEditorName('Code.org');
hostedIDE.setupEditorTransition(/*allowDevTools*/ true);
hostedIDE.setupNavigationBar();
hostedIDE.setupIPCPipe();