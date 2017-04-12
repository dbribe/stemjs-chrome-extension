const port = chrome.extension.connect({name: "popup"});

const magicButton = document.getElementById("magic");

magicButton.addEventListener("click", () => {
    port.postMessage({type: "magicStarted"});
});
