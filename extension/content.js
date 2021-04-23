let { name, version } = chrome.runtime.getManifest();
if (document.contentType == 'text/html') {
	if (location.search) {
		let corsProxy = (Object.fromEntries(new URLSearchParams(location.search)).corsProxy || '').replace(/"([^"]+)":/g, (s, k) => ('"'+k.toLowerCase()+'":'));
		if (corsProxy) {
			let code = '',
				corsProxy_ = JSON.parse(corsProxy);
			if (corsProxy_['user-agent'] && (corsProxy_['user-agent'] != navigator.userAgent)) {
				code +=  '('+function(corsProxy) {
					Object.defineProperty(navigator, 'userAgent', {
						get: () => corsProxy['user-agent']
					});
				}+')('+corsProxy+');';
			}
			if (corsProxy_['referer'] && (corsProxy_['referer'] != document.referrer)) {
				code +=  '('+function(corsProxy) {
					Object.defineProperty(document, 'referrer', {
						get: () => corsProxy['referer']
					});
				}+')('+corsProxy+');';
			}
			if (code) {
				let s = document.createElement('script');
				s.textContent = code;
				document.documentElement.appendChild(s);
				s.remove();
			}
		}
	}
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
}
