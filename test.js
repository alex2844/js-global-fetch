var self = ((typeof(window) == 'object') ? window : global);
var worker;
var fn = {
	fetch: null,
	Request: null,
	AbortController: null
};
var tests = {
	corsWorker: function() {
		return fetch(worker+'https://api.qwedl.com/ip.php?c=1', {
			headers: {
				'Content-type': 'application/json',
				'Cors-Referer': null,
				'Cors-User-Agent': 'corsWorker'
			}
		}).then(function(res) {
			return res.json().then(function(body) {
				return ((!body.headers.Referer && (body.headers['User-Agent'] == 'corsWorker') && (res.headers.get('x-test') == 'Test 2')) && 'ok');
			});
		}).catch(function(err) {
			return 'Error: '+err.message;
		});
	},
	corsUpload: function(e) {
		var file,
			data = new FormData();
		if ('document' in self)
			try {
				file = new File([ JSON.stringify({ name: 'js-global-fetch' }) ], 'package.json', { type:'application/json' });
			} catch (e) {
				file = new Blob([ JSON.stringify({ name: 'js-global-fetch' }) ], { type:'application/json' });
				file.lastModified = file.lastModifiedDate = new Date();
				file.name = 'package.json';
			}
		else
			file = require('fs').createReadStream('package.json');
		data.append('file', file);
		return fetch(worker+'https://api.qwedl.com/ip.php?format=json', {
			method: 'POST',
			body: data
		}).then(function(res) {
			return res.json().then(function(body) {
				return ((
					body.data.files.file.size && (body.data.files.file.name == 'package.json') &&
					(body.data.files.file.type == 'application/json') && (body.data.files.file.data.name == 'js-global-fetch')
				) && 'ok');
			});
		}).catch(function(err) {
			console.info(err);
			return 'Error: '+err.message;
		});
	},
	corsForm: function(e) {
		return fetch(worker+"https://api.qwedl.com/ip.php?format=json", {
			body: 'asd1=qwe&asd2=qwe',
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' }
		}).then(function(res) {
			return res.json().then(function(body) {
				return (((body.data.post.asd1 == 'qwe') && (body.data.post.asd2 == 'qwe')) && 'ok');
			});
		}).catch(function(err) {
			return 'Error: '+err.message;
		});
	},
	corsOk: function() {
		return fetch(worker).then(function(res) {
			return res.text();
		}).then(function(body) {
			return ((body == worker+'<url>') && 'ok');
		}).catch(function(err) {
			return 'Error: '+err.message;
		});
	},
	corsErr: function() {
		return fetch(worker+'/iscorsneeded').then(function(res) {
			return res.text();
		}).then(function(body) {
			return ((body == (('document' in self) ? 'yes' : 'no')) && 'ok');
		}).catch(function(err) {
			return (((err.message == 'Failed to fetch') || (err.message.indexOf('is not allowed by Access-Control-Allow-Origin.') > -1)) ? 'ok' : 'Error: '+err.message);
		});
	},
	corsVideo: function() {
		return fetch(worker+'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', {
			method: 'HEAD'
		}).then(function(res) {
			return (((res.headers.get('content-length') == '158008374') && (res.headers.get('content-type') == 'video/mp4')) && 'ok');
		}).catch(function(err) {
			return 'Error: '+err.message;
		});
	},
	timeout: function() {
		var acs = new AbortController();
		setTimeout(function() {
			acs.abort();
		}, 10);
		return fetch('https://api.qwedl.com/ip.php', {
			signal: acs.signal
		}).then(function(res) {
			return res.text();
		}).catch(function(err) {
			return ((err.name == 'AbortError') ? 'ok' : 'Error: '+err.message);
		});
	}
};
var count = Object.keys(tests).length;
function log(obj) {
	if ('document' in self) {
		if (!count)
			document.querySelector('.content header button').hidden = true;
		var el = document.querySelector('code');
		el.innerHTML = JSON.stringify(obj, null, '\t');
		el.classList.remove('prettyprinted');
		if ('PR' in window)
			PR.prettyPrint();
	}else{
		console.clear();
		console.log(obj);
	}
}
Object.keys(fn).forEach(function(f) {
	if (!!self[f])
		fn[f] = 'native';
});
log({ fn });
if ('document' in self) {
	if (!Object.keys(fn).filter(function(f) {
		return !fn[f];
	}).length)
		load();
	else{
		var polyfill = document.createElement('script');
		polyfill.src = './dist/polyfill.js';
		polyfill.onload = load;
		document.body.appendChild(polyfill);
	}
}else{
	var { fetch, Request, FormData, AbortController } = polyfill = require('./');
	load();
}
function load() {
	Object.keys(fn).filter(function(f) {
		return !fn[f];
	}).forEach(function(f) {
		if (!!self[f] || !!polyfill[f])
			fn[f] = 'polyfill';
	});
	log({ fn });
	if ('document' in self) {
		if ('worker' in sessionStorage)
			worker = sessionStorage.getItem('worker');
		else if ((worker = prompt('Worker url')) != null)
			sessionStorage.setItem('worker', worker);
		tests_();
	}else{
		if (worker = process.env.WORKER)
			tests_();
		else{
			var rl = require('readline').createInterface({
				input: process.stdin,
				output: process.stdout
			});
			rl.question('Worker url: ', function(worker_) {
				worker = worker_;
				rl.close();
				tests_();
			});
		}
	}
}
function tests_() {
	var _tests = {};
	for (var k in tests) {
		(function(k) {
			if (worker || (k.slice(0, 4) != 'cors'))
				tests[k]().then(function(res) {
					--count;
					_tests[k] = res;
					log({ worker, fn, _tests });
				});
			else{
				--count;
				_tests[k] = 'worker not found';
				log({ fn, _tests });
			}
		})(k);
	}
}
