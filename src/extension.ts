import * as vscode from "vscode";
import fs from "fs";
import path from "path";

import * as servers from "./modules/servers/main";
import { WebSocketServer } from "ws";

let server: WebSocketServer;

export function activate(context: vscode.ExtensionContext) {
	server?.close();

	let workspace_folder: vscode.WorkspaceFolder | undefined;
	if (workspace_folder = vscode.workspace.workspaceFolders?.find(x => x.name === "Krunker sync")){
		if (fs.readdirSync(workspace_folder.uri.fsPath).includes(".tmp")){
			fs.rmSync(path.join(workspace_folder.uri.fsPath, ".tmp"));
			server = servers.establish_server(workspace_folder);
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand("krunkscript-linker.connect", (): void => {
		server = servers.sync_server();
	}));
}

export function deactivate() {
	server?.close();
	vscode.window.showErrorMessage("Host disconnected.");
}