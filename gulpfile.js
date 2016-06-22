var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    streamify = require('gulp-streamify'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    watchify = require('watchify'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

gulp.task('build', ['sass', 'html', 'image'], function(){
    function bundle (bundler) {   
        return bundler
            .bundle()
            .on('error', function(e){
                gutil.log(e);
            })
            .pipe(source('bundle.js'))
            .pipe(streamify(sourcemaps.init()))
            .pipe(streamify(uglify()))
            .pipe(streamify(sourcemaps.write('./maps')))
            .pipe(gulp.dest('dist/files/js'))
            .pipe(browserSync.stream());
    }

    var watcher = watchify( 
        browserify('./src/files/js/index.js', watchify.args)
            .transform(require('browserify-css'), {
                rootDir: '.',
                autoInject: 'true',
                minify: 'true'
            })
    );

    bundle(watcher);
    watcher.on('update', function(){
        bundle(watcher);
    });
    watcher.on('log',gutil.log);

    browserSync.init({
        server:{ 
            baseDir:  "dist",
            routes: {
                "/files": "files"
            }, 
            index: "views/index.html"
        },
        logFileChanges: false
    });
});

/********** compile sass **********/
gulp.task('sass', ['sass:watch'], function () {
    return gulp.src('./src/files/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./src/files/css'));
});

/********** minify html **********/
gulp.task('html', ['html:watch'], function() {
    return gulp.src('./src/views/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/views'));
});

/********** minify image **********/
gulp.task('image', function() {
    gulp.src('./src/files/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/files/img'));
});

/********** watch sass **********/
gulp.task('sass:watch', function () {
    gulp.watch('./src/files/sass/*.scss', ['sass'])
        .on('log', gutil.log);
});

/********** watch html **********/
gulp.task('html:watch', function () {
    gulp.watch('./src/views/*.html', ['html'])
        .on('log', gutil.log);
    reload();
});

