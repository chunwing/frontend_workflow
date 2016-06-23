var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    streamify = require('gulp-streamify'),

    glob = require('glob'),
    buffer = require('vinyl-buffer'),
    es = require('event-stream'),
    inject = require('gulp-inject'),
    rename     = require('gulp-rename'),

    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    watchify = require('watchify'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;



gulp.task('dev', ['injectsass', 'html:watch'], function(done){

    glob('files/js/*.js', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            var b = browserify({
                entries: [entry],
                extensions: ['.js'],
                debug: true,
                cache: {},
                packageCache: {},
                fullPaths: true
            })
            .plugin(watchify);

        var bundle = function() {
            return b.bundle()
                .on('error', function(e){
                    gutil.log(e);
                })
                .pipe(source(entry))
                .pipe(buffer())
                .pipe(gulp.dest('dist'))
                .pipe(browserSync.stream());
        };

        b.on('update', bundle);
        b.on('log',gutil.log);
        return bundle();
        });
        es.merge(tasks).on('end', done);
    });
    

    browserSync.init({
        injectChanges: true,
        server:{ 
            baseDir:  "./",
            routes: {
                "/files": "files"
            }, 
            index: "views/t1_.html"
        },
        logFileChanges: false
    });

});

gulp.task('injectsass', ['sass:watch'], function(done){
    var injectAppFiles = gulp.src('files/sass/public/*.scss', {read: false});

    function transformFilepath(filepath) {
        return '@import "' + filepath + '";';
    }

    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:app',
        endtag: '// endinject',
        addRootSlash: false
    };

    glob('files/sass/*.scss', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            return gulp.src(entry)
                .pipe(inject(injectAppFiles, injectAppOptions))
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(sourcemaps.write('./maps'))
                .pipe(gulp.dest('files/css'))
                .pipe(browserSync.stream({match: '**/*.css'}));

        });
        es.merge(tasks).on('end', done);
    });
});

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
    return gulp.src('files/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('files/css'));
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
    gulp.watch('files/sass/*.scss', ['injectsass'])
        .on('log', gutil.log);
});

/********** watch html **********/
gulp.task('html:watch', function () {
    gulp.watch('views/*.html', ['html'])
        .on('log', gutil.log);
    reload();
});

