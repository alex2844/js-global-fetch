#!/usr/bin/env node

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const
	NodeFetch = require('node-fetch'),
	FormData = require('form-data');

let AbortController = {};
try {
	AbortController = require('./dist/abort-controller');
} catch (e) {
	console.error('Exec: npm run build');
}

module.exports = {
	CorsProxy: async (fastify, opts) => (fastify
		.addContentTypeParser('*', (req, done) => done(null, req))
		.all('/*', async (req, rep) => {
			let res = {
				status: 200,
				headers: {},
				body: ''
			};
			try {
				let query = (new URLSearchParams(req.query)).toString(),
					url = req.params['*']+(query ? '?'+query : '');
				if (!url) {
					url = ((req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].startsWith('https')) ? 'https:' : 'http:')+'//'+req.hostname+req.raw.url;
					res.body = url.replace(/\/$/, '')+'/<url>';
				}else if (url == '/iscorsneeded')
					return (req.headers['sec-fetch-dest'] ? 'yes' : 'no');
				else{
					if (req.raw.method != 'OPTIONS') {
						let headers = {};
						for (let k in req.headers) {
							if (!k.match(/^host/i) && !k.match(/^origin/i) && !k.match(/^cf-/i) && !k.match(/^x-forw/i) && !k.match(/^cors-/i))
								headers[k] = req.headers[k];
						}
						for (let k in req.headers) {
							let k_;
							if (k.match(/^cors-/i) && (k_ = k.replace(/^cors-/i, ''))) {
								if (req.headers[k] && (req.headers[k] != 'null'))
									headers[k_] = req.headers[k];
								else
									delete headers[k_];
							}
						}
						let get = await NodeFetch(url, {
							method: req.raw.method,
							headers: headers,
							redirect: 'follow',
							body: req.body
						});
						headers = {};
						for (let pair of get.headers.entries()) {
							if ([ 'keep-alive', 'transfer-encoding', 'content-encoding' ].indexOf(pair[0]) == -1)
								headers[pair[0]] = pair[1];
						}
						res.status = get.status;
						res.headers = headers;
						res.body = get.body;
					}
				}
				if (req.headers['origin']) {
					res.headers['Access-Control-Allow-Origin'] = req.headers['origin'];
					res.headers['Access-Control-Allow-Credentials'] = 'true';
					if (req.headers['access-control-request-headers'])
						res.headers['Access-Control-Allow-Headers'] = req.headers['access-control-request-headers'];
					res.headers['Access-Control-Expose-Headers'] = '*';
				}
			} catch (e) {
				res.status = 500;
				res.body = e.message;
			}
			rep.status(res.status || 200).headers(res.headers || {}).send(res.body || '');
		})
	),
	fetch: (url, options) => {
		if (/^\/\//.test(url))
			url = 'http:'+url;
		if (options && options.headers)
			for (let k in options.headers) {
				let k_;
				if (k.match(/^cors-/i) && (k_ = k.replace(/^cors-/i, ''))) {
					if (options.headers[k] && (options.headers[k] != 'null'))
						options.headers[k_] = options.headers[k];
					delete options.headers[k];
				}
			}
		return (NodeFetch.default || NodeFetch).call(this, url, options);
	},
	Headers: NodeFetch.Headers,
	Request: NodeFetch.Request,
	Response: NodeFetch.Response,
	FormData,
	AbortController
};
if (module.parent === null)
	module.exports.CorsProxy(require('fastify')()).then(fastify => {
		fastify.listen((process.env.PORT || 0), () => console.log('Server started http://localhost:'+fastify.server.address().port));
	});
