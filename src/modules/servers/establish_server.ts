import path from "path";
import * as vscode from "vscode";
import WebSocket, { WebSocketServer } from "ws";
import socket_message from "../../interfaces/websocket_callback/socket_message";

export default function establish_server(workspace: vscode.WorkspaceFolder): WebSocketServer {
	const server: WebSocketServer = new WebSocket.Server({
		port: 8586
	});

	server.on("connection", (socket: WebSocket) => {
		if (server.clients.size > 1) {
			socket.close();
			vscode.window.showErrorMessage("You can only connect 1 editor at a time.");
			return;
		}
		else {
			vscode.window.showInformationMessage("Succesfully connected. Ready for use.");
		}

		socket.onclose = (): void => {
			vscode.window.showInformationMessage("Krunkscript disconnected.");
			server.clients.clear();
		};

		socket.onmessage = (msg: WebSocket.MessageEvent): void => {
			let ws_content: any = JSON.parse(msg.data.toString("utf-8"));
			switch (ws_content?.type) {
				case "error": 
				let errors = ws_content.message.split("\n");
				for (let index = 0; index < errors.length; index++) {
					let x = vscode.window.showErrorMessage(errors[index]);
				}
				
				break;

				case "success":
					vscode.window.showInformationMessage("Compiled succesfully");
				break;
			}
		};

		vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
			if (document.languageId === "krnk" && document.uri.scheme === "file") {

				let down_sync: socket_message = {type: "down_sync", server: null, client: null};
				let file_name: string = path.basename(document.fileName, ".krnk") ?? null;
				down_sync[file_name] = document.getText().replace("\r", "");
				socket.send(JSON.stringify(down_sync));
			}
		});
	});

	return server;
}