const
	{ fetch } = require('./'),
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify');

gulp.task('AbortController', done => {
	gulp.src(path.join(__dirname, 'node_modules', 'abort-controller', 'dist', 'abort-controller.js'))
		.pipe(gulp.dest('dist'))
		.on('end', () => done())
});
gulp.task('polyfill', done => {
	let fn = path.join(__dirname, 'dist', 'polyfill.js');
	fetch('https://polyfill.io/v3/polyfill.js?features=AbortController', {
		headers: { 'user-agent': 'Mozilla/1.22 (compatible; MSIE 10.0; Windows 3.1)' }
	}).then(res => res.text()).then(body => {
		fs.writeFile(fn, body.replace('function fetch', (function fetch_gas(input, init) {
			return Promise.resolve().then(function() {
				var req = UrlFetchApp.fetch(input, init),
					code = req.getResponseCode();
				return new Response(req.getContentText(), {
					status: code,
					statusText: (code === 200 ? 'OK' : ''),
					headers: req.getHeaders(),
					url: input
				});
			})
		}).toString()+'\n\n  function fetch_xhr').replace('fetch.polyfill', (function fetch(input, init) {
			return ((typeof(XMLHttpRequest) == 'function') ? fetch_xhr(input, init) : (
				(typeof(UrlFetchApp) == 'object') ? fetch_gas(input, init) : Promise.reject(new Error('Hmmm...'))
			));
		}).toString()+'\n\n	fetch.polyfill'), err => {
			if (err)
				return console.log(err);
			gulp.src(fn)
				.pipe(plumber())
				.pipe(uglify())
				.pipe(gulp.dest('dist'))
				.on('end', () => done())
		});
	}).catch(() => done());
});
gulp.task('default', gulp.series('AbortController', 'polyfill'));
