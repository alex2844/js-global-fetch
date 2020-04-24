self.addEventListener('fetch', async event => {
	const
		req = event.request,
		url = new URL(req.url);
	if ((url.hostname == 'localhost') && (url.pathname != '/iscorsneeded'))
		return;
	event.respondWith((async () => {
		let res;
		try {
			if (url.pathname === '/')
				res = new Response(url.origin+'/<url>');
			else if (url.pathname === '/iscorsneeded')
				return new Response((req.headers.get('sec-fetch-dest')) ? 'yes' : 'no');
			else if ((!self.location || (self.location.hostname == url.hostname)) && !url.pathname.startsWith('/http'))
				res = new Response('Not Found', { 
					status: 404,
					statusText: 'Not Found',
					headers: { 'Content-Type': 'text/html' }
				});
			else{
				if (req.method == 'OPTIONS')
					res = new Response(null, {
						status: 200,
						statusText: 'OK'
					});
				else{
					let headers = {};
					if (self.location)
						headers = req.headers;
					else{
						for (let h of req.headers.entries()) {
							if (!h[0].match(/^origin/i) && !h[0].match(/^cf-/i) && !h[0].match(/^x-forw/i) && !h[0].match(/^cors-/i))
								headers[h[0]] = h[1];
						}
						for (let h of req.headers.entries()) {
							if (h[0].match(/^cors-/i) && ((h[0] = h[0].replace(/^cors-/i, '')) != 'cache')) {
								if (h[1] && (h[1] != 'null'))
									headers[h[0]] = h[1];
								else
									delete headers[h[0]];
							}
						}
					}
					let get = await fetch((url.pathname.startsWith('/http') ? req.url.slice(url.origin.length + 1) : url.href), {
						method: req.method,
						headers: headers,
						redirect: 'follow',
						body: req.body
					});
					res = new Response(get.body, get);
				}
			}
			if (req.headers.get('Origin')) {
				res.headers.set('Access-Control-Allow-Origin', req.headers.get('Origin'));
				res.headers.set('Access-Control-Allow-Credentials', 'true');
				if (req.headers.get('Access-control-request-headers'))
					res.headers.set('Access-Control-Allow-Headers', req.headers.get('Access-control-request-headers'));
				res.headers.set('Access-Control-Expose-Headers', '*');
			}
			if (req.headers.get('Cors-Cache')) {
				res.headers.set('Cache-control', 'public');
				res.headers.set('Expires', new Date(Date.now() + parseInt(req.headers.get('Cors-Cache'))).toUTCString());
			}
		} catch (e) {
			res = new Response((e.stack || e), { status: 500 });
		}
		return res;
	})());
});
