const gulp         = require('gulp');
const sass         = require('gulp-sass');
const sourcemaps   = require('gulp-sourcemaps');
const browserSync  = require('browser-sync').create();
const cssnano      = require('gulp-cssnano');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const concat       = require('gulp-concat');
const imagemin     = require('gulp-imagemin');
const cache        = require('gulp-cache');
const kit          = require('gulp-kit');
const htmlmin      = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const babel        = require('gulp-babel');
const zip          = require('gulp-zip');
const del          = require('del');
const plumber      = require('gulp-plumber');
const notifier     = require('gulp-notifier');

notifier.defaults({
	messages: {
		sass: "CSS was successfully compiled",
		js:   "JS is ready",
		kit:  "Html was delivered",
	},
	prefix: "=====",
	suffix: "=====",
	exclusions: ".map"
})


filesPath = {
	sass:'./src/sass/main*.scss',
	js:'./src/js/**/*.js',
	img:'./src/img/**/*.+(png|jpg|gif|svg)',
	html:'./html/**/*.kit'
}

//Sass
gulp.task("sass", function(done){
	return gulp
		.src(filesPath.sass)
		.pipe(plumber({serrorHandler: notifier.error}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(sass())
		.pipe(cssnano())
		.pipe(sourcemaps.write("."))
		.pipe(rename(function(path){
			if(!path.extname.endsWith(".map")){
				path.basename += ".min"
			}
		}))
		.pipe(gulp.dest('./dist/css'))
	done();
});

//image optimization
gulp.task("imagemin", function(done){
	return(
		gulp.src(filesPath.img)
		.pipe(plumber({serrorHandler: notifier.error}))
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('./dist/img/'))
	)
	done();
})

gulp.task('kit',function(done){
	return(
		gulp.src(filesPath.html)
		.pipe(plumber({serrorHandler: notifier.error}))
		.pipe(kit())
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('./'))
	)
	done();
})

//Javascript
gulp.task('javascript', function(done){
	return gulp
		.src(filesPath.js)
		.pipe(plumber({serrorHandler: notifier.error}))
		.pipe(babel({
			presets: ["@babel/env"]
		}))
		.pipe(concat('project.js'))
		.pipe(uglify())
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(gulp.dest("./dist/js"))
	done();
})


//Watch Task With Browser Sync
gulp.task("watch", function(){
	browserSync.init({
		server: {
			baseDir: "./"
		},
		browser: ["google chrome"]
	})
	gulp.watch(
		[
			'./src/sass/**/*.scss',
			filesPath.js,
			filesPath.html,
			filesPath.img
		], 
		gulp.parallel(['sass','javascript','imagemin','kit'])
	)
	.on("change", browserSync.reload)
})

gulp.task('clear-cache', function(done){
	return cache.clearAll(done);
});

gulp.task("serve", gulp.parallel(['sass','javascript','imagemin','kit']));

// gulp default command
gulp.task('default',gulp.series(['serve','watch']));

//zip
gulp.task('zip',function(done){
	return(
		gulp.src(['./**/*','!./node_modules/**/*'])
		.pipe(zip('project.zip'))
		.pipe(gulp.dest('./'))
	)
	done();
})

// clean dist folder
gulp.task('clean-dist',function(done){
	return del(['./dist/**/*'])
	done();
})




