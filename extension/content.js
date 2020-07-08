let { name, version } = chrome.runtime.getManifest();
document.documentElement.setAttribute('data-cors-proxy', JSON.stringify({
	id: chrome.runtime.id,
	name, version
}));
