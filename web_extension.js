// ==UserScript==
// @name         VSCode Krunkerscript link
// @version      0.1
// @description  Write krunkscript thru vscode.
// @author       Swat
// @match        *://krunker.io/editor.html
// @run-at       document-start
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

GM_addStyle(`
   .vscode_icon{
      height: 25px;
      background-image: url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fexternal-preview.redd.it%2FWSuAcyz1u8MoF8cokXspkmOIn8oWXaE8JH-SGXbUUW0.png%3Fauto%3Dwebp%26s%3Da6abc62ecb4a08f2bf2f287b79c9bd93006791d1&f=1&nofb=1);
      background-repeat: no-repeat;
      background-size: contain;
      filter: brightness(3) grayscale(1);
      padding-left: 5px;
      padding-right: 5px;
      cursor: pointer;
   }

   .vscode_icon:hover{
      filter: none;
   }
`);

let socket;
let pinging;
let accepted;
let restoring = false;

unsafeWindow.onload = () => {
    let x = 0;
    const observer = new MutationObserver(function(mutations) {
        x++;
        let el = Array.from(document.getElementById("_toolbar").children).find(x => x.innerText == "Scripting");
        if (el && x > 1){
            el.style.display = "none";
            document.getElementById("_toolbar").style.gridTemplateColumns = "60px 60px 90px 80px 55px 85px 70px 60px 120px 25px";

            let div = document.createElement("div");
            div.classList.add("vscode_icon");
            div.onclick = ping;
            document.getElementById("_toolbar").appendChild(div);

            observer.disconnect();
        }
    });
    observer.observe(document.getElementById("_toolbar"), {childList: true, subtree: true});
}

function ping(){
    socket = new WebSocket("ws://localhost:8586");
    socket.onopen = is_established;
    socket.onclose = ping;
    console.log("ping..");
}

function is_established(){
    if (accepted ?? (accepted = !confirm("VSCode found, would you like to connect?"))){
        return;
    }

    if (!restoring){
        console.info("Server found and connected!");

        unsafeWindow.KE.scriptPopup();
        unsafeWindow.KE.scriptWin.onload = function(){
            unsafeWindow.KE.scriptWin.close();
            socket.send(JSON.stringify({type: "up_sync"}));
        }
    }

    socket.onmessage = (message) => {
        let packet = JSON.parse(message.data);

        switch (packet?.type){
            case "restore":
                restoring = true;
                socket.send(JSON.stringify({
                    type: "restore",
                    client: unsafeWindow.KE.scriptWin.cm.client.getDoc().getValue(),
                    server: unsafeWindow.KE.scriptWin.cm.server.getDoc().getValue()
                }));
                socket.onclose = ping;
                break;
        }
    }

    socket.onclose = () => {
        if (confirm("VSCode disconnected, would you like to keep pinging the server to reconnect?")) {
            ping();
        }
    }
}
