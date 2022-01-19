import * as vscode from "vscode";
import up_sync from "../../interfaces/websocket_callback/socket_message";
import tmp from "tmp";
import path from "path";

export default async function(ws_content: up_sync){    
    const folder = tmp.dirSync({keep: true});
    const folder_uri = vscode.Uri.file(folder.name);
    const tmp_file = new vscode.WorkspaceEdit();

    vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.file(path.join(folder_uri.path)),
        name: "Krunker sync"
    });

    Object.keys(ws_content).filter(x => x !== "type").map(type => {
        const files = new vscode.WorkspaceEdit();
        const file_uri: vscode.Uri = vscode.Uri.file(path.join(folder_uri.path, type + ".krnk"));

        files.createFile(file_uri, {overwrite: true});
        files.set(file_uri, [vscode.TextEdit.insert(new vscode.Position(0, 0), ws_content[type] ?? "")]);
        vscode.workspace.applyEdit(files);
    });

    tmp_file.createFile(vscode.Uri.file(path.join(folder_uri.path, ".tmp")));
    vscode.workspace.applyEdit(tmp_file);
}
