const pageScript = document.createElement('script');
pageScript.src = chrome.extension.getURL('page.js');

const pageStyle = document.createElement("link");
pageStyle.rel = "stylesheet";
pageStyle.href = chrome.extension.getURL('page.css');

const documentHead = (document.head || document.documentElement);
documentHead.appendChild(pageScript);
documentHead.appendChild(pageStyle);
