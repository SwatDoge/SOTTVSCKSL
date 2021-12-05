import * as vscode from "vscode";
import up_sync from "../../../models/websocket_callback/socket_message";
import tmp from "tmp";
import path from "path";

export default async function(ws_content: up_sync){    
    const folder = tmp.dirSync({keep: true});
    const folder_uri = vscode.Uri.file(folder.name);
    const wsedit = new vscode.WorkspaceEdit();

    vscode.workspace.updateWorkspaceFolders(0, vscode.workspace.workspaceFolders?.length, {
        uri: vscode.Uri.file(path.join(folder_uri.path)),
        name: "Krunker sync"
    });

    Object.keys(ws_content).filter(x => x !== "type").map(type => {
        const file_uri: vscode.Uri = vscode.Uri.file(path.join(folder_uri.path, type + ".krnk"));

        wsedit.createFile(file_uri);
        wsedit.set(file_uri, [vscode.TextEdit.insert(new vscode.Position(0, 0), ws_content[type] ?? "")]);
        vscode.workspace.applyEdit(wsedit);
    });

    wsedit.createFile(vscode.Uri.file(path.join(folder_uri.path, ".tmp")));
    vscode.workspace.applyEdit(wsedit);

    wsedit.createFile(vscode.Uri.file(path.join(folder_uri.path, "libraries/")));
    vscode.workspace.applyEdit(wsedit);

    vscode.workspace.saveAll();
}