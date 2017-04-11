let mainPort;
chrome.runtime.onConnectExternal.addListener((port) => {
    mainPort = port;
});

chrome.contextMenus.create({title: "inspect Stem Element", id: "stemDevTool"});
chrome.contextMenus.onClicked.addListener(() => {
    mainPort.postMessage({type: "inspectElement"});
});

alert(chrome.runtime.id);
