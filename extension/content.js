let { name, version } = chrome.runtime.getManifest();
chrome.storage.local.get({
	enabled: true
}, config => {
	if (config.enabled) {
		document.documentElement.setAttribute('data-cors-proxy', JSON.stringify({
			id: chrome.runtime.id,
			name, version, config
		}));
		window.addEventListener('message', event => {
			if (event.data.corsProxy)
				event.source.postMessage({
					_corsProxy_: new Function('return ('+event.data.corsProxy+')()')(),
					timeStamp: event.data.timeStamp
				}, '*');
		});
	}
});
