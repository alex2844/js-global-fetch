chrome.storage.local.get({
	enabled: true,
	antizapret: false
}, ps => {
	let headerFind = (headers, key, value) => {
		let o = headers.find(({ name }) => name.match(new RegExp(key, 'i')));
		return (o ? o.value : (value || null));
	}
	let proxy = () => chrome.proxy.settings.set({
		value: (!ps.antizapret ? { mode: 'system' } : {
			mode: 'pac_script',
			pacScript: {
				url: 'https://antizapret.prostovpn.org/proxy.pac',
				mandatory: true
			}
		}),
		scope: 'regular'
	});
	if (ps.antizapret)
		proxy();
	chrome.contextMenus.create({
		title: 'Enable cors',
		type: 'checkbox',
		checked: ps.enabled,
		contexts: [ 'browser_action' ],
		onclick: ({ checked }) => {
			ps.enabled = checked;
			chrome.storage.local.set(ps);
		}
	});
	chrome.contextMenus.create({
		title: 'Antizapret',
		type: 'checkbox',
		checked: ps.antizapret,
		contexts: [ 'browser_action' ],
		onclick: ({ checked }) => {
			proxy(ps.antizapret = checked);
			chrome.storage.local.set(ps);
		}
	});
	chrome.contextMenus.create({
		title: 'Save cookies',
		contexts: [ 'browser_action' ],
		onclick: () => chrome.tabs.getSelected(null, tab => chrome.cookies.getAll({
			url: (tab.url.replace(/^chrome.*:\/\/.*/, '') || null)
		}, cookies => chrome.downloads.download({
			filename: 'cookies.txt',
			url: URL.createObjectURL(new Blob([
				[
					'# This file can be used by wget, curl, aria2c and other standard compliant tools.',
					'# Usage Examples:',
					'#   1) wget -x --load-cookies cookies.txt "'+tab.url+'"',
					'#   2) curl --cookie cookies.txt "'+tab.url+'"',
					'#   3) aria2c --load-cookies cookies.txt "'+tab.url+'"',
					''
				].concat(cookies.map(v => [
					v.domain,
					(v.hostOnly ? 'FALSE' : 'TRUE'),
					v.path,
					(v.secure ? 'TRUE' : 'FALSE'),
					(v.expirationDate ? Math.round(v.expirationDate) : '0'),
					v.name,
					v.value
				].join('\t'))).join('\n')
			], { type: 'text/plain;charset=utf-8' }))
		})))
	});
	chrome.webRequest.onBeforeSendHeaders.addListener(({ url, requestHeaders }) => (!ps.enabled ? {} : {
		requestHeaders: requestHeaders.map(h => {
			let i, k;
			if (h.name.match(/^cors-/i) && (k = h.name.replace(/^cors-/i, ''))) {
				if ((i = requestHeaders.findIndex(h_ => h_.name.match(new RegExp('^'+k+'$', 'i')))) > -1)
					requestHeaders[i].value = null;
				return { name: k, value: h.value };
			}
			return h;
		}).filter(h => (h.value && (h.value != 'null'))).concat(Object.entries(
			JSON.parse(Object.fromEntries(new URLSearchParams('?'+url.split('?')[1])).corsProxy || '{}')
		).map(h => ({
			name: h[0], value: h[1]
		})))
	}), {
		urls: [	'<all_urls>' ]
	}, [
		'blocking', 'requestHeaders', 'extraHeaders'
	]);
	chrome.webRequest.onHeadersReceived.addListener(({ responseHeaders }) => (!ps.enabled ? {} : {
		responseHeaders: responseHeaders.concat([
			{ name: 'Access-Control-Allow-Origin', value: headerFind(responseHeaders, 'access-control-allow-origin', '*') },
			{ name: 'Access-Control-Allow-Methods', value: headerFind(responseHeaders, 'access-control-allow-methods', '*') },
			{ name: 'Access-Control-Allow-Headers', value: headerFind(responseHeaders, 'access-control-allow-headers', '*') },
			{ name: 'Access-Control-Expose-Headers', value: '*' },
			{ name: 'Access-Control-Allow-Credentials', value: 'true' }
		])
	}), {
		urls: [	'<all_urls>' ]
	}, [
		'blocking', 'responseHeaders'
	]);
});
