const parseKeyEvent = (event) => {
    return (event.metaKey ? "T" : "F") + (event.ctrlKey ? "T" : "F") + (event.altKey ? "T" : "F") +
        (event.shiftKey ? "T" : "F") + event.code;
};

const isMac = () => {
    return navigator.platform.match("Mac");
};

const port = chrome.extension.connect({name: "popup"});

let config = {
    shortcut: "",
    clearConsole: true,
};

const saveConfig = () => {
    chrome.storage.sync.set({"StemJS": config});
    port.postMessage({type: "setStorageValue", key: "StemJSshortcut", value: config.shortcut});
    port.postMessage({type: "setStorageValue", key: "StemJSclearConsole", value: config.clearConsole});
};

const getConfig = (callback) => {
    chrome.storage.sync.get("StemJS", (result) => {
        if (result.StemJS) {
            config = result.StemJS;
        }
        saveConfig();
        callback();
    });
};

const clearConsoleCheckbox = document.getElementById("clearConsole");

getConfig(() => {
    clearConsoleCheckbox.checked = config.clearConsole;
});
clearConsoleCheckbox.addEventListener("change", () => {
    config.clearConsole = clearConsoleCheckbox.checked;
    saveConfig();
});

const parseInspectShortcut = (value) => {
    console.warn(value);
    const symbols = isMac() ?
          ["Cmd + ", "Ctrl + ", "Alt + ", "Shift + "] : ["Win + ", "Ctrl + ", "Alt + ", "Shift + "];
    let shortcut = "";
    for (let i = 0; i < 4; i += 1) {
        if (value[i] === "T") {
            shortcut += symbols[i];
        }
    }
    shortcut += value.slice(7);
    return shortcut;
};

const shortcutSpan = document.getElementById("shortcut");
const recordInspectShortcutButton = document.getElementById("recordInspectShortcut");

getConfig(() => {
    shortcutSpan.innerHTML = parseInspectShortcut(config.shortcut);
});
recordInspectShortcutButton.addEventListener("click", () => {
    let keydownHandler = document.addEventListener("keydown", (event) => {
        const shortcut = parseKeyEvent(event);
        shortcutSpan.innerHTML = parseInspectShortcut(shortcut);
        config.shortcut = shortcut;
        saveConfig();
    });
    let keyupHandler = document.addEventListener("keyup", (event) => {
        document.removeEventListener("keydown", keydownHandler);
        document.removeEventListener("keyup", keyupHandler);
    });
});
