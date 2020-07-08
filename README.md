# globalFetch

[![Version](https://img.shields.io/npm/v/js-global-fetch.svg)](https://www.npmjs.org/package/js-global-fetch) [![Extension](https://www.google.com/images/icons/product/chrome_web_store-32.png)](https://alex2844.github.io/js-global-fetch/index.html?extension)

## Universal Fetch API, FormData, AbortController, CorsProxy for Nodejs and Browsers

#### Install
###### nodejs
``` bash
npm install js-global-fetch
```
###### cdn
``` html
<script src="https://alex2844.github.io/js-global-fetch/dist/polyfill.js"></script>
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
