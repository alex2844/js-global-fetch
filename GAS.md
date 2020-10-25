# globalFetch

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
