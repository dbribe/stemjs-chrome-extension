const extensionID = "dljmijiigdaaihfmigaefbmnnakcgief";
const mainPort = chrome.runtime.connect(extensionID);
sessionStorage.setItem("stemDevTools", "true");

let contextMenuEvent;
document.addEventListener("contextmenu", (event) => {
    contextMenuEvent = event;
});

let counter = 0;

mainPort.onMessage.addListener((event) => {
    if (event.type === "inspectElement") {
        let node = document.elementFromPoint(contextMenuEvent.pageX, contextMenuEvent.pageY);
        window.original = node;
        console.clear();
        console.warn("el" + (++counter) + " = ", node.stemElement);
        window["el" + counter] = node.stemElement;
    }
});
