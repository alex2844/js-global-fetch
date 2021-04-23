# globalFetch

[![Version](https://img.shields.io/npm/v/js-global-fetch.svg)](https://www.npmjs.org/package/js-global-fetch) [![Extension](https://www.google.com/images/icons/product/chrome_web_store-32.png)](https://alex2844.github.io/js-global-fetch/index.html?extension)

## Universal Fetch API, FormData, AbortController, CorsProxy for Nodejs, Browsers and Google Apps Script

#### Install
###### nodejs
``` bash
npm install js-global-fetch
```
###### cdn
``` html
<script src="https://alex2844.github.io/js-global-fetch/dist/polyfill.js"></script>
```
###### Google Apps Script (https://github.com/alex2844/js-global-fetch/blob/master/GAS.md)
###### extension
- chrome://extensions/
- Dev mode on
- 'Load unpacked extension' button and select the unzipped folder for your extension to install it.

#### Usage
###### Get json
``` javascript
const { fetch } = require('js-global-fetch');
fetch('https://httpbin.org/get', {
	headers: {
		'Cors-Cache': 60*60*24*1000,
		'Cors-Referer': 'https://alex2844.github.io/js-global-fetch/',
		'Cors-User-Agent': 'globalFetch'
	}
})
.then(res => res.json())
.then(body => console.log(body));
```
###### CorsProxy as a plugin for Fastify
``` javascript
const
	Fastify = require('fastify'),
	{ CorsProxy } = require('js-global-fetch');
(Fastify()
	.register(CorsProxy, { prefix: '/proxy' }) // http://localhost:3000/proxy/
	.get('/', async (req, rep) => 'Index page') // http://localhost:3000/
	.listen(3000, () => console.log('Server start'))
);
```
###### Get iframe content
``` html
<iframe src="https://httpbin.org/get" frameborder="0" allowfullscreen="true" width="500" height="300" loading="lazy"></iframe>
<script>
	$('iframe').addEventListener('load', event => {
		// console.log(event.target.contentWindow.document.body.innerHTML); // Blocked a frame with origin "http://localhost:8080" from accessing a cross-origin frame.
		new Promise(res => {
			let onmessage = e_ => {
				if (e_.data._corsProxy_ && (event.timeStamp == e_.data.timeStamp)) {
					window.removeEventListener('message', onmessage, false);
					return res(e_.data._corsProxy_);
				}
			}
			event.target.contentWindow.postMessage({
				corsProxy: (() => document.body.innerHTML).toString(),
				timeStamp: event.timeStamp
			}, '*');
			window.addEventListener('message', onmessage, false);
		}).then(html => {
			console.log(JSON.parse(html.replace(/^(.*?)>/, '').replace(/<(.*?)$/, '')));
		});
	}, { once: true });
</script>
```
###### Open "Youtube on TV"
https://www.youtube.com/tv?corsProxy={%22user-agent%22:%22Mozilla/%20Chrome/%20Mobile%20Safari/;%20SMART-TV%22}

#### Run cli
``` bash
PORT=3000 globalFetch
```

#### Demo and tests
https://alex2844.github.io/js-global-fetch/
