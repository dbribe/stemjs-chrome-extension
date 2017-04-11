const contentScript = document.createElement('script');
contentScript.src = chrome.extension.getURL('content.js');
contentScript.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(contentScript);
