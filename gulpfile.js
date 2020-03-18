const
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sass = require('gulp-sass'),
	cleanCSS = require('gulp-clean-css'),
	closureCompiler = require('google-closure-compiler').gulp(),
	browserSync = require('browser-sync').create();

gulp.task('css', done => {
	gulp.src('src/scss/**/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(cleanCSS())
		.pipe(gulp.dest('dist/css'))
		.on('end', () => done())
		.pipe(browserSync.stream());
});
gulp.task('js', done => {
	let task = gulp.src([
		'src/js/FILENAME'
	]).pipe(plumber());
	if (process.env.COMPILER != 'false')
		task = task.pipe(closureCompiler({
			compilation_level: 'SIMPLE',
			js_output_file: 'FILENAME'
		}, { platform: ['native', 'java', 'javascript'] }));
	task.pipe(gulp.dest('dist/js')).on('end', () => done()).pipe(browserSync.stream());
});
gulp.task('html', async () => {
	if (process.env.DEV != 'true')
		return;
	browserSync.init({ server: './' });
	gulp.watch('src/scss/**/*.scss', gulp.series('css'));
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('*.html').on('change', () => browserSync.reload());
});
gulp.task('default', gulp.series('css', 'js', 'html'));
