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
        pagePort.onMessage.addListener((message) => {
            port.postMessage(message);
        });
    }
});

chrome.contextMenus.create({title: "Enter DOM Inspector", id: "enterDOMInspector", onclick: () => {
    pagePort.postMessage({type: "hoverInspector"});
}});
