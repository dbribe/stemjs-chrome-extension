const parseKeyEvent = (event) => {
    return (event.metaKey ? "T" : "F") + (event.ctrlKey ? "T" : "F") + (event.altKey ? "T" : "F") +
        (event.shiftKey ? "T" : "F") + event.code;
};

const isMac = () => {
    return navigator.platform.match("Mac");
};

const port = chrome.extension.connect({name: "popup"});
let ID = 0;
const createUniqueID = () => {
    ID += 1;
    return ID;
};

const localStorage = {
    getItem: (key, callback) => {
        let value;
        const getID = createUniqueID();
        port.postMessage({type: "getStorageValue", id: getID, key: key});
        port.onMessage.addListener((response) => {
            if (response.id === getID) {
                callback(response.value);
                return;
            }
        });
    },
    setItem: (key, value) => {
        port.postMessage({type: "setStorageValue", key: key, value: value});
    }
};


const clearConsoleCheckbox = document.getElementById("clearConsole");
localStorage.getItem("clearConsole", (value) => {
    clearConsoleCheckbox.checked = (value === "true");
});
clearConsoleCheckbox.addEventListener("change", () => {
    localStorage.setItem("clearConsole", clearConsoleCheckbox.checked.toString());
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
localStorage.getItem("inspectShortcut", (value) => {
    if (value) {
        shortcutSpan.innerHTML = parseInspectShortcut(value);
    }
});
recordInspectShortcutButton.addEventListener("click", () => {
    let keydownHandler = document.addEventListener("keydown", (event) => {
        const shortcut = parseKeyEvent(event);
        shortcutSpan.innerHTML = parseInspectShortcut(shortcut);
        localStorage.setItem("inspectShortcut", shortcut);
    });
    let keyupHandler = document.addEventListener("keyup", (event) => {
        document.removeEventListener("keydown", keydownHandler);
        document.removeEventListener("keyup", keyupHandler);
    });
});
