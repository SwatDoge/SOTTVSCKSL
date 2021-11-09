import * as vscode from "vscode";
import WebSocket, { WebSocketServer } from "ws";

export function activate(context: vscode.ExtensionContext) {
	console.log("Plugin activated");

	let disposable = vscode.commands.registerCommand("krunkscript-linker.connect", (): void => {
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

			socket.on("message", (msg: WebSocket.MessageEvent) => {
				console.log(msg);
				socket.send("this is just a test");
			});

			vscode.window.showInformationMessage("Client connected.");
		});

		vscode.window.showInformationMessage("Started up server, looking for a link...");
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
