import * as vscode from 'vscode';
import { getNonce } from './util';

class shaEditor {

	public static activeEditor: shaEditor | null = null;

	constructor(
		public readonly document: vscode.TextDocument,
		public readonly webviewPanel: vscode.WebviewPanel
	) {}

	public updateWebview() {
		this.webviewPanel.webview.postMessage({
			type: 'update',
			text: this.document.getText()
		});
	}

}

export class shaEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.Disposable.from(
			vscode.window.registerCustomEditorProvider(shaEditorProvider.viewType,
				new shaEditorProvider(context))
		);
	}

	private static readonly viewType = 'shaEditorView';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {enableScripts: true};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		const editor = new shaEditor(document, webviewPanel);

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				editor.updateWebview();
			}
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'add':
					return;
			}
		});

		editor.updateWebview();
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		const base = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist'));
		const nonce = getNonce();
		return /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
	<style>body.vscode-dark { color: black; padding: 0; }</style>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource}; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Hion - HiAsm WEB ide online</title>
	<base href="${base}/">
	<link href="cm/lib/codemirror.css" rel="stylesheet" type="text/css"/>
	<script src="cm/lib/codemirror.js" nonce="${nonce}" type="text/javascript"></script>
	<link href="cm/hint/show-hint.css" rel="stylesheet" type="text/css"/>
	<script src="cm/hint/show-hint.js" nonce="${nonce}" type="text/javascript"></script>
	<script src="cm/mode/javascript.js" nonce="${nonce}" type="text/javascript"></script>
	<script src="cm/hint/javascript-hint.js" nonce="${nonce}" type="text/javascript"></script>
	<script src="cm/mode/css.js" nonce="${nonce}" type="text/javascript"></script>
	<script src="cm/mode/hws.js" nonce="${nonce}" type="text/javascript"></script>
	<script src="js/htmltools.js" nonce="${nonce}" type="text/javascript"></script>
	<link href="css/styles.css" rel="stylesheet" type="text/css"/>
	<script src="app.bundle.js" nonce="${nonce}" type="text/javascript"></script>
	<script nonce="${nonce}" type="text/javascript">API_NONCE="${nonce}";</script>
</head>
<body>
	<div id="workspace"><div class="hion-toolbar" id="toolbar"></div></div>
	<div id="open-form"></div>
	<div id="splash"><div class="logo"><div id="loaderstate"></div></div></div>
</body>
</html>`;
	}

}
