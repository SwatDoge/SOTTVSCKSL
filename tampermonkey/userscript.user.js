// ==UserScript==
// @name         VSCode Krunkerscript link
// @version      0.1
// @homepage     https://docs.swatdo.ge/_tampermonkey.html
// @icon         https://swatdo.ge/images/krunk_sync.png
// @updateURL    https://github.com/SwatDoge/VSCode-krunkscript-linker/raw/main/tampermonkey/userscript.user.js
// @downloadURL  https://github.com/SwatDoge/VSCode-krunkscript-linker/raw/main/tampermonkey/userscript.user.js
// @supportURL   https://discord.gg/bz8abvq
// @description  Write krunkscript thru vscode.
// @author       Swat
// @match        *://krunker.io/editor.html
// @grant        GM_addStyle
// @grant        unsafeWindow
// @grant        GM_notification
// @run-at       document-start
//
// @require      https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// ==/UserScript==

let socket;
let connect_button;
let window_open = unsafeWindow.open;

GM_addStyle(`
#connect_button{
   transition: filter 200ms;
   background-image: url(https://swatdo.ge/images/vscode_logo.png);
   background-repeat: no-repeat;
   background-size: contain;
   background-position-y: -1px;
   background-position-x: center;
   position: relative;
   inset: 0;
   margin: 4.5px;
   cursor: pointer;
   filter: grayscale(1) brightness(2);
}

#connect_button:hover{
   filter: unset;
}

#playbar{
   grid-template-columns: 50% 50% 50% 50% !important;
}
`);

unsafeWindow.onload = function(){
    generate_button();
};

function generate_button(){
    connect_button = document.createElement("div");
    connect_button.onclick = ping;
    connect_button.id = "connect_button";
    document.getElementById("playbar").appendChild(connect_button);
}

function toggle_button(active){
    connect_button.onclick = active ? function(){GM_notification("Your are already connected to vscode", "Heads up", "https://swatdo.ge/images/vscode_logo.png", () => {})} : ping;
    connect_button.style.cursor = active ? "not-allowed" : "pointer";
    connect_button.style.opacity = active ? 0.25 : 1;
}

function ping(){
    toggle_button(true);
    socket = new WebSocket("ws://localhost:8586");
    socket.onopen = init;
    socket.onclose = function() {
        toggle_button(false);
        if (confirm("No editor found, want to try again?")) ping();
    }
    console.log("pinging...");
}

function reping(){
    toggle_button(true);
    socket = new WebSocket("ws://localhost:8586");
    socket.onopen = establish;
    socket.onclose = reping;
    console.log("reping..");
}

unsafeWindow.WebSocket = class extends unsafeWindow.WebSocket {
    constructor(...args){
        super(...args);
        this.addEventListener("open", event => {
            let onmessage = this.onmessage;
            this.onmessage = function(){
                let ws_message = msgpack.decode(new Uint8Array(arguments[0].data));
                switch(ws_message[0]){
                    case "ksC":
                        if (ws_message[1] != null) socket.send(JSON.stringify({type: "error", message: ws_message[1]}));
                        else socket.send(JSON.stringify({type: "success"}));
                        break;
                }
                return onmessage.apply(this, arguments);
            }
        });
    }
};

function establish(){
    toggle_button(true);
    socket.onclose = function(){
        toggle_button(false);
        if (confirm("Editor disconnected, want to try again?")) ping();
    }
    socket.onmessage = (message) => {
        let ws_content = JSON.parse(message.data);
        switch(ws_content.type){
            case "down_sync":
                Object.entries(ws_content).map(x => {
                    if (x[0] !== "type" && x[1] !== null){
                        unsafeWindow.KE.currentKey = x[0];
                        let page_exists = unsafeWindow.KE.scriptWin.cm[x[0]] && unsafeWindow.KE.scripts[x[0]];
                        if (page_exists){
                            unsafeWindow.KE.scripts[x[0]].code = x[1];
                            try{unsafeWindow.KE.scriptWin.cm[x[0]].setValue(x[1]);}
                            catch(e){}
                        }
                    }
                });
                unsafeWindow.KE.updateScript();
                break;
        }
    };
}

function init(){
    toggle_button(true);
    console.info("Server found, please wait...");

    try{
        unsafeWindow.KE.scriptPopup();
        unsafeWindow.KE.scriptWin.onload = function(){
            unsafeWindow.KE.scriptWin.close();
            let packet = {
                type: "up_sync",
                client: unsafeWindow.KE.scriptWin.cm.client.getDoc().getValue(),
                server: unsafeWindow.KE.scriptWin.cm.server.getDoc().getValue()
            };
            socket.send(JSON.stringify(packet));
        };
    }
    catch{
        alert("Something went wrong, please retry");
        return;
    }

    socket.onmessage = (message) => {
       if (JSON.parse(message.data).type === "restore"){
            socket.send(JSON.stringify({type: "restore"}));
            socket.onclose = () => {};
            socket.close();
            reping();
        }
    };
}