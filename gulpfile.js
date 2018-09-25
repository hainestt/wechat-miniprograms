const px2rpx      = require('./vendor/px2rpx')
const gulp        = require('gulp')
const del         = require('del')
const postcss     = require('gulp-postcss')
const sass        = require('gulp-sass')
const rename      = require('gulp-rename')
const changed     = require('gulp-changed')
const runSequence = require('run-sequence')
const yargs       = require('yargs').argv
const cssBase64   = require('gulp-css-base64')
const uglify      = require('gulp-uglify')
const gutil       = require('gulp-util')
const babel       = require('gulp-babel')
const replace     = require('gulp-replace')

const dest        = './dist'
const outstyle    = {
		n: 'nested',
		e: 'expanded',
		ct: 'compact',
		cd: 'compressed'
	}

gulp.task('css', () => {
	let processors = [px2rpx()]

	gulp.src(['src/**/*.scss', '!src/sass/mixin.scss'], {base: 'src'})
		.pipe(changed(dest, {hasChanged: changed.compareContents}))
		.pipe(sass({errLogToConsole: true, outputStyle: outstyle.cd}))
		.pipe(postcss(processors))
		.pipe(cssBase64({
			maxWeightResource: 100 * 1024
		}))
		.pipe(rename((path) => path.extname = '.wxss'))
		.pipe(gulp.dest(dest))
})


gulp.task('json', () => {
	gulp.src(['src/**/*.json', 'project.config.json'])
		.pipe(changed(dest, {hasChanged: changed.compareContents}))
		.pipe(gulp.dest(dest))
})

gulp.task('wxml', () => {
	gulp.src('src/pages/**/*.wxml', {base: 'src'})
		.pipe(replace(/<!--((.|\n|\r)*?)-->/gm, ''))
		.pipe(replace(/\n\s*|\r*/g, ''))
		.pipe(changed(dest, {hasChanged: changed.compareContents}))
		.pipe(gulp.dest(dest))
})

gulp.task('js:dev', () => {
	gulp.src('src/**/*.js')
		.pipe(babel({
			presets: [ 'env' ],
			// plugins: ['transform-runtime']
		}))
		.pipe(changed(dest, {hasChanged: changed.compareContents}))
		.on('error', err => {
			gutil.log(gutil.colors.red('[Error]'), err.toString())
		})
		.pipe(gulp.dest(dest))
})

gulp.task('js:live', () => {
	gulp.src('src/**/*.js')
		.pipe(babel({
			presets: [ "env" ]
			// ,
			// plugins: ['transform-runtime']
		}))
		.pipe(uglify({
			mangle: false,
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}))
		.on('error', err => {
			gutil.log(gutil.colors.red('[Error]'), err.toString())
		})
		.pipe(gulp.dest(dest))
})

gulp.task('clean', () => {
	return del(dest)
})

gulp.task('watch', () => {
	gulp.watch('src/**/*.wxml', ['wxml'])
	gulp.watch('src/**/*.js', ['js:dev'])
	gulp.watch('src/**/*.scss', ['css'])
	gulp.watch('src/**/*.json', ['json'])
	gulp.watch('src/assets/**/*', ['img'])
})

gulp.task('build:dev', cb => {
	runSequence('clean', ['css', 'js:dev', 'json', 'wxml'], cb)
})

gulp.task('build:live', cb => {
	runSequence('clean', ['css', 'js:live', 'json', 'wxml'], cb)
})

gulp.task('default', () => {
	switch(true) {
		case yargs.c:
			gulp.start('clean')
			break
		case yargs.d:
			gulp.start('build:dev')
			break
		case yargs.l:
			gulp.start('build:live')
			break
		default:
			gulp.start('build:dev')
			gulp.start('watch')
	}

})
