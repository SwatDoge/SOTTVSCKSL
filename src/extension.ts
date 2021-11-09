import * as vscode from "vscode";
import WebSocket, { WebSocketServer } from "ws";

import * as websocket_callbacks from "./modules/websocket_callback/main";

export function activate(context: vscode.ExtensionContext) {
	console.log("Plugin activated");

	let disposable = vscode.commands.registerCommand("krunkscript-linker.connect", (): void => {

		//create server.
		const server: WebSocketServer = new WebSocket.Server({
			port: 8586
		});

		//on connection.
		server.on("connection", (socket: WebSocket) => {
			if (server.clients.size > 1) {
				socket.close();
				vscode.window.showErrorMessage("You can only connect 1 editor at a time.");
				return;
			}

			//if client disconnects, make space for new client. only one client at a time.
			socket.onclose = (): void => {
				vscode.window.showInformationMessage("Client disconnected.");
				server.clients.clear();
			};

			//websocket callbacks
			socket.onmessage = (msg: WebSocket.MessageEvent): void => {
				let ws_content: any = JSON.parse(msg.data.toString("utf-8"));				

				switch (ws_content?.type) {
					case "up_sync": websocket_callbacks.up_sync(ws_content); break;
				}
			};

			vscode.window.showInformationMessage("Client connected.");
		});

		vscode.window.showInformationMessage("Started up server, looking for a link...");
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
