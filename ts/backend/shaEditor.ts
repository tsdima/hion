import * as vscode from 'vscode';
import { getNonce } from './util';

class shaEditor {

	public static activeEditor: shaEditor | null = null;
	public static newText: string = '';

	constructor(
		public readonly document: vscode.TextDocument,
		public readonly webviewPanel: vscode.WebviewPanel
	) {}

	public static setText(document: vscode.TextDocument, text: string) : Thenable<boolean> {
		const edit = new vscode.WorkspaceEdit();
		const r = new vscode.Range(0,0,document.lineCount,0);
		edit.replace(document.uri, document.validateRange(r), text);
		return vscode.workspace.applyEdit(edit);
	}

	public updateWebview() {
		if (this.document.fileName=='') {
			this.webviewPanel.webview.postMessage({
				type: 'update',
				name: 'Project',
				text: shaEditor.newText
			});
		} else {
			this.webviewPanel.webview.postMessage({
				type: 'update',
				name: this.document.fileName,
				text: this.document.getText()
			});
		}
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
	private distUri: vscode.Uri;
	private packUri: vscode.Uri;
	private lang: any;
	private proj: any;
	private packs: Promise<any>;
	private canupdate: boolean = true;

	constructor(
		private readonly context: vscode.ExtensionContext
	) {
		this.distUri = vscode.Uri.joinPath(this.context.extensionUri, 'dist');
		this.packUri = vscode.Uri.joinPath(this.distUri, 'pack');
		this.packs = this.loadPacks();
	}

	private async loadProject(name: string, prj: string) : Promise<any> {
		const projUri = vscode.Uri.joinPath(this.packUri, name, 'new', prj+'.sha');
		const value = await vscode.workspace.fs.readFile(projUri);
		return { name: prj, text: value.toString() };
	}

	private async loadPack(name: string) : Promise<any> {
		let fs = vscode.workspace.fs; let obj: any = { name:name }; this.proj[name] = {}
		const langUri = vscode.Uri.joinPath(this.packUri, name, 'lang', 'ru.json');
		const packUri = vscode.Uri.joinPath(this.packUri, name, 'pack.json');
		const elemUri = vscode.Uri.joinPath(this.packUri, name, 'elements.json');
		obj.lang = JSON.parse((await fs.readFile(langUri)).toString());
		obj.pack = JSON.parse((await fs.readFile(packUri)).toString());
		obj.elements = JSON.parse((await fs.readFile(elemUri)).toString());
		const prj = await Promise.all(obj.pack.projects.map((prj:string) => this.loadProject(name, prj)));
		prj.forEach((value:any) => { this.proj[name][value.name] = value.text; });
		return obj;
	}

	private async loadPacks() : Promise<any> {
		let fs = vscode.workspace.fs; this.proj = {};
		const langUri = vscode.Uri.joinPath(this.distUri, 'lang', 'ru.json');
		const listUri = vscode.Uri.joinPath(this.packUri, 'list.txt');
		this.lang = JSON.parse((await fs.readFile(langUri)).toString());
		return Promise.all((await fs.readFile(listUri)).toString().split('\n').map(item => this.loadPack(item)));
	}

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
				if (this.canupdate) editor.updateWebview();
			}
		});

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
			//editor.updateOutline(false);
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
			case 'onready':
				this.packs.then(packs => {
					webviewPanel.webview.postMessage({type:'dosetpacks', lang:this.lang, packs:packs});
				});
				break;
			case 'onsetpacks': editor.updateWebview(); break;
			case 'onsavefile':
				this.canupdate = false;
				shaEditor.setText(document, e.text).then(ok=>{
					document.save().then(ok=>{
						this.canupdate = true;
					});
				});
				break;
			case 'new':
				shaEditor.newText = this.proj[e.pack][e.item];
				vscode.commands.executeCommand('workbench.action.files.newUntitledFile', {viewType:'shaEditorView'});
				break;
			}
		});
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		const base = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist'));
		const nonce = getNonce();
		return /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
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
