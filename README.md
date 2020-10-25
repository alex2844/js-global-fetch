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
###### Google Apps Script
*package.json*
``` json
{
	"main": "app.js",
	"scripts": {
		"deploy": "webpack --entry ./global.js --output-path ./ --output-filename polyfill.js && clasp push && clasp open --webapp",
		"test": "node --require ./global.js app.js"
	},
	"devDependencies": {
		"@google/clasp": "^2.3.0",
		"js-global-fetch": "^1.5.0",
		"webpack": "^5.2.0",
		"webpack-cli": "^4.1.0"
	}
}
```
*global.js*
``` javascript
if (typeof(require) == 'function') {
	const { fetch } = require('js-global-fetch');
	global.fetch = fetch;
}
```
*app.js*
``` javascript
let doGet = () => HtmlService.createHtmlOutputFromFile('index').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
let testGet = () => fetch('https://httpbin.org/get', {
	headers: {
		referer: 'https://alex2844.github.io/js-global-fetch/'
	}
}).then(res => res.json());
if (typeof(process) == 'object')
	testGet().then(body => console.log(body));
```
*index.html*
``` html
<!DOCTYPE html>
<html>
<head>
	<base target="_self" />
</head>
<body>
	<pre></pre>
	<script>
		Promise.all([
			fetch('https://httpbin.org/get', {
				headers: {
					referer: 'https://alex2844.github.io/js-global-fetch/'
				}
			}).then(res => res.json()),
			new Promise((res, rej) => google.script.run.withSuccessHandler(body => res(body)).withFailureHandler(err => rej(err)).testGet())
		]).then(res => (document.querySelector('pre').innerHTML = JSON.stringify({
			local: res[0],
			remote: (res[1]._v || res[1])
		}, null, '\t')));
	</script>
</body>
</html>
```
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

#### Run cli
``` bash
PORT=3000 globalFetch
```

#### Demo and tests
https://alex2844.github.io/js-global-fetch/
