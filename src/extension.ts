import * as vscode from "vscode";
import WebSocket, { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";

import * as websocket_callbacks from "./modules/websocket_callback/main";

export function activate(context: vscode.ExtensionContext) {

	let workspace_folder: vscode.WorkspaceFolder | undefined;
	if (workspace_folder = vscode.workspace.workspaceFolders?.find(x => x.name == "Krunker sync")){
		if (fs.readdirSync(workspace_folder.uri.fsPath).includes(".tmp")){
			fs.rmSync(path.join(workspace_folder.uri.fsPath, ".tmp"));
			createServer();
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand("krunkscript-linker.connect", (): void => {
		const server: WebSocketServer = new WebSocket.Server({
			port: 8586
		});

		server.on("connection", (socket: WebSocket) => {
			if (server.clients.size > 1) {
				socket.close();
				vscode.window.showErrorMessage("You can only connect 1 editor at a time.");
				return;
			}

			socket.onclose = (): void => {
				server.clients.clear();
			};

			socket.onmessage = (msg: WebSocket.MessageEvent): void => {
				let ws_content: any = JSON.parse(msg.data.toString("utf-8"));

				switch (ws_content?.type) {
					case "up_sync":
						socket.send(JSON.stringify({type: "restore"}));
					break;
					case "restore": 
						websocket_callbacks.up_sync(ws_content);
					break;
				}
			};
		});

		vscode.window.showInformationMessage("Starting up server, looking to link and sync..");
	}));

	function createServer(): void {
		let restored_connection = true;
		//create server.
		const server: WebSocketServer = new WebSocket.Server({
			port: 8586
		});

		server.on("connection", (socket: WebSocket) => {
			if (server.clients.size > 1) {
				socket.close();
				vscode.window.showErrorMessage("You can only connect 1 editor at a time.");
				return;
			}

			socket.onclose = (): void => {
				vscode.window.showInformationMessage("Client disconnected.");
				server.clients.clear();
			};

			socket.onmessage = (msg: WebSocket.MessageEvent): void => {
				let ws_content: any = JSON.parse(msg.data.toString("utf-8"));

				console.log(ws_content?.type);
				switch (ws_content?.type) {
					
				}
			};

			vscode.window.showInformationMessage(restored_connection ? "Succesfully synced. Ready for use." : "Client connected!");
			restored_connection = true;
		});
	}
}

export function deactivate() {
	vscode.window.showErrorMessage("Host disconnected.");
}
