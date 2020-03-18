const
	{ fetch } = require('./'),
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify');

gulp.task('AbortController', done => {
	let fn = path.join(__dirname, 'dist', 'abort-controller.js');
	if (fs.existsSync(fn))
		done();
	else
		gulp.src(path.join(__dirname, 'node_modules', 'abort-controller', 'dist', 'abort-controller.js'))
			.pipe(gulp.dest('dist'))
			.on('end', () => done())
});
gulp.task('polyfill', done => {
	let fn = path.join(__dirname, 'dist', 'polyfill.js'),
		dn = path.dirname(fn);
	if (fs.existsSync(fn))
		done();
	else
		fetch('https://polyfill.io/v3/polyfill.min.js?features=AbortController', {
			headers: { 'user-agent': 'Mozilla/1.22 (compatible; MSIE 10.0; Windows 3.1)' }
		}).then(res => res.text()).then(body => {
			if (!fs.existsSync(dn))
				fs.mkdirSync(dn, { recursive: true });
			fs.writeFile(fn, body, err => {
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
