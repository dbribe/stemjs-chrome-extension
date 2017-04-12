const pageScript = document.createElement('script');
pageScript.src = chrome.extension.getURL('page.js');
// pageScript.onload = function() {
//     this.remove();
// };
const pageStyle = document.createElement("link");
pageStyle.rel = "stylesheet";
pageStyle.href = chrome.extension.getURL('page.css');
(document.head || document.documentElement).appendChild(pageScript);
(document.head || document.documentElement).appendChild(pageStyle);
