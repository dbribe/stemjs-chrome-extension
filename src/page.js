const parseKeyEvent = (event) => {
    return (event.metaKey ? "T" : "F") + (event.ctrlKey ? "T" : "F") + (event.altKey ? "T" : "F") +
        (event.shiftKey ? "T" : "F") + event.code;
};

const extensionID = "hjcngnecejoklbllfnefohkmlibjanhc";
const mainPort = chrome.runtime.connect(extensionID, {name: "page"});
sessionStorage.setItem("stemDevTools", "true");

let contextMenuEvent;
document.addEventListener("contextmenu", (event) => {
    contextMenuEvent = event;
});

let counter = 0;

mainPort.onMessage.addListener((event) => {
    if (event.type === "hoverInspector") {
        HoverInspector.getInstance().start();
    } else if (event.type === "setStorageValue") {
        localStorage.setItem(event.key, event.value);
    }
});

class BaseClass {
    static getInstance() {
        if (this.hasOwnProperty("singletonInstance")) {
            return this.singletonInstance;
        } else {
            return this.singletonInstance = new this();
        }
    }
}

function getCoords(node) {
    return {
        x: node.getBoundingClientRect().left,
        y: node.getBoundingClientRect().top
    };
};

function getDimensions(node) {
    if (node.offsetWidth != null) {
        return {width: node.offsetWidth, height: node.offsetHeight};
    } else {
        const rect = node.getBoundingClientRect();
        return {width: parseInt(rect.width), height: parseInt(rect.height)};
    }
}

document.addEventListener("keydown", (event) => {
    if (parseKeyEvent(event) === localStorage.getItem("StemJSshortcut")) {
        HoverInspector.getInstance().start();
    }
});


class HoverInspector extends BaseClass{
    start() {
        this.node = null;
        this.oldNode = null;
        this.createTooltip();
        this.mousemoveListener = document.body.addEventListener("mousemove", (event) => {
            this.mousemoveEvent = event;
            this.setCurrentNode(event.target);
        });
        this.keyupListener = document.addEventListener("keyup", (event) => {
            if (event.keyCode == 87) { // W
                if (this.node === document.body) {
                    this.setCurrentNode(document.body);
                    return;
                }
                const parent = this.node.stemElement ? this.node.stemElement.parent.node : this.node.parentNode;
                if (parent) {
                    this.setCurrentNode(parent);
                }
            }
        });
        this.highlightPanel = document.createElement("div");
        this.highlightPanel.className = "stem-highlight-panel";
        document.body.appendChild(this.highlightPanel);
        this.scrollEventListener = document.addEventListener('scroll', () => {
            if (this.mousemoveEvent) {
                this.setCurrentNode(document.elementFromPoint(this.mousemoveEvent.x, this.mousemoveEvent.y));
                this.positionHighlightPanel();
            }
        }, true);
        this.clickHandler = (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.constructor.inspectElement(this.node);
            this.end();
        };
        document.addEventListener("click", this.clickHandler, true);

        this.escapeHandler =  (event) => {
            if (event.keyCode == 27) { // Esc
                event.stopPropagation();
                event.preventDefault();
                this.end();
            }
        };
        document.addEventListener("keyup", this.escapeHandler, true);
    }

    end() {
        this.destroyTooltip();
        document.body.removeEventListener("mousemove", this.mousemoveListener);
        document.removeEventListener("keyup", this.keyupListener);
        if (this.highlightPanel.parentNode === document.body) {
            document.body.removeChild(this.highlightPanel);
        }
        document.removeEventListener("scroll", this.scrollEventListener);
        document.removeEventListener("click", this.clickHandler, true);
        document.removeEventListener("keyup", this.escapeHandler, true);
        document.removeEventListener("keydown", this.keyInspectHandler, true);
    }

    static inspectElement(node) {
        if (localStorage.getItem("StemJSclearConsole") === "true") {
            console.clear();
        }
        console.info("el" + (++counter) + " = ", node.stemElement, node);
        window["el" + counter] = node.stemElement;
    };

    setCurrentNode(node) {
        this.node = node;
        if (node !== this.oldNode) {
            if (node) {
                let name = (node.stemElement ? node.stemElement.constructor.name : node.tagName.toLowerCase());
                if (name === "UIElement") {
                    name = node.tagName.toLowerCase();
                }

                const dimensions = getDimensions(node);
                this.tooltip.innerHTML = `${dimensions.width} x ${dimensions.height}
                                          <span class="stem-tooltip-tag-name">${name}</span>`;

                this.positionHighlightPanel();
            }
        }
        this.oldNode = this.node;
    }

    positionHighlightPanel() {
        const coords = getCoords(this.node);
        const dimensions = getDimensions(this.node);
        this.highlightPanel.style.left = coords.x + "px";
        this.highlightPanel.style.top = coords.y + "px";
        this.highlightPanel.style.width = dimensions.width + "px";
        this.highlightPanel.style.height = dimensions.height + "px";
    }

    createTooltip() {
        this.tooltip = document.createElement("div");
        this.tooltip.className = "stem-tooltip";
        document.body.appendChild(this.tooltip);
        this.tooltipMousemoveListener = document.body.addEventListener("mousemove", (event) => {
            this.tooltip.style.left = Math.min(window.innerWidth - this.tooltip.offsetWidth - 17, event.x)+"px";
            this.tooltip.style.top = Math.max(event.y - this.tooltip.offsetHeight, 0) + "px";
        });
    }

    destroyTooltip() {
        if (this.tooltip.parentNode === document.body) {
            document.body.removeChild(this.tooltip);
        }
        document.body.removeEventListener("mousemove", this.tooltipMousemoveListener);
    }
}
