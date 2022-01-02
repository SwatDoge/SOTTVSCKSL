import * as vscode from "vscode";
import WebSocket, { WebSocketServer } from "ws";

import * as websocket_callbacks from "../websocket_callback/main";
import socket_message from "../../interfaces/websocket_callback/socket_message";

export default function sync_server(): WebSocketServer{
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
            let ws_content: socket_message = JSON.parse(msg.data.toString("utf-8"));
            let sync_content: socket_message = {type: "up_sync", server: "", client: ""};

            switch (ws_content?.type) {
                case "up_sync":
                    sync_content = ws_content;
                    socket.send(JSON.stringify({type: "restore"}));
                    server.close();
                    websocket_callbacks.up_sync(sync_content);
                break;
            }
        };
    });

    vscode.window.showInformationMessage("Connection is up, looking to sync with editor...");

    return server;
}