import * as vscode from 'vscode';
import { shaEditorProvider } from './shaEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(shaEditorProvider.register(context));
}
