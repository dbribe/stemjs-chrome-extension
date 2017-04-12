const extensionID = "dljmijiigdaaihfmigaefbmnnakcgief";
const mainPort = chrome.runtime.connect(extensionID, {name: "page"});
sessionStorage.setItem("stemDevTools", "true");

let contextMenuEvent;
document.addEventListener("contextmenu", (event) => {
    contextMenuEvent = event;
});

let counter = 0;

mainPort.onMessage.addListener((event) => {
    if (event.type === "inspectElement") {
        inspectElement();
    } else if (event.type === "magicStarted") {
        HoverInspector.getInstance().start();
    }
});

const inspectElement = function() {
    let node = contextMenuEvent.target;
    window.original = node;
    console.clear();
    console.warn("el" + (++counter) + " = ", node.stemElement, node);
    window["el" + counter] = node.stemElement;
};

class BaseClass {
    static getInstance() {
        if (this.constructor.instance) {
            return this.constructor.instance;
        } else {
            return this.constructor.instance = new HoverInspector();
        }
    }
}

function getCoords(node) {
    let x = 0;
    let y = 0;
    while(node) {
        x += node.offsetLeft - node.scrollLeft;
        y += node.offsetTop - node.scrollTop;
        node = node.offsetParent;
    }
    return {x: x, y: y};
}


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
                this.setCurrentNode(this.node.parentNode);
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
    }

    end() {
        this.destroyTooltip();
        document.body.removeEventListener("mousemove", this.mousemoveListener);
        document.removeEventListener("keyup", this.keyupListener);
        document.body.eraseChild(this.highlightPanel);
    }

    setCurrentNode(node) {
        this.node = node;
        if (node !== this.oldNode) {
            if (node) {
                let name = (node.stemElement ? node.stemElement.constructor.name : node.tagName.toLowerCase());
                if (name === "UIElement") {
                    name = node.tagName.toLowerCase();
                }
                this.tooltip.innerHTML = `${node.offsetWidth} x ${node.offsetHeight} ${name}`;
                this.positionHighlightPanel();

                const traceEvent = new KeyboardEvent("keypress", {
                    key: "c",
                    ctrlKey: true,
                    shiftKey: true,
                });
                document.dispatchEvent(traceEvent);
            }
        }
        this.oldNode = this.node;
    }

    positionHighlightPanel() {
        const coords = getCoords(this.node);
        this.highlightPanel.style.left = coords.x + "px";
        this.highlightPanel.style.top = coords.y + "px";
        this.highlightPanel.style.width = this.node.offsetWidth + "px";
        this.highlightPanel.style.height = this.node.offsetHeight + "px";
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
        document.body.eraseChild(this.tooltip);
        document.body.removeEventListener("mousemove", this.tooltipMousemoveListener);
    }
}
