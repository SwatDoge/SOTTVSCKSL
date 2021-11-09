import * as vscode from "vscode";
import up_sync from "../../../models/websocket_callback/socket_message";
import tmp from "tmp";
import path from "path";

export default async function(ws_content: up_sync){    
    let folder = tmp.dirSync({keep: true});
    let folder_uri = vscode.Uri.file(folder.name);

    vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.file(path.join(folder_uri.path)),
        name: "Krunker sync"
    });

    /*["client", "server"].map(type => {
        let file_uri = vscode.Uri.file(path.join(folder_uri.path, type + ".krnk"));
        wsedit.createFile(file_uri);
        vscode.workspace.applyEdit(wsedit);

        if (ws_content.type){
            vscode.workspace.openTextDocument(file_uri).then(doc => {
                vscode.window.showTextDocument(doc);
            });
            //{content: `# ${type}\n${ws_content[type]}`, language: "krnk"}
        } else {
            vscode.window.showErrorMessage(type, "script could not be imported");
        }
    });
    console.log("a");
    */
}