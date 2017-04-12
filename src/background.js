let pagePort, popupPort;
chrome.runtime.onConnectExternal.addListener((port) => {
    if (port.name === "page"){
        pagePort = port;
    }
});

chrome.extension.onConnect.addListener((port) => {
    if (port.name === "popup") {
        port.onMessage.addListener((message) => {
            pagePort.postMessage(message);
        });
    }
});

chrome.contextMenus.create({title: "Inspect Stem Element", id: "stemDevTool"});
chrome.contextMenus.onClicked.addListener(() => {
    pagePort.postMessage({type: "inspectElement"});
});
