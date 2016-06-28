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
    htmlreplace = require('gulp-html-replace'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    sourcemaps = require('gulp-sourcemaps'),
    watchify = require('watchify'),
    autoprefixer = require('autoprefixer'),
    postcss      = require('gulp-postcss'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;
gulp.task('dev', ['injectsass', 'html'], function(done){
    glob('files/js/*.js', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            gulp.src(entry)
                .pipe(htmlreplace({
                    'css': '\n// inject:app\n// endinject\n'
                }, {
                    keepBlockTags: true
                }
                ))
                .pipe(gulp.dest('files/js'));
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
        port: 3014,
        server:{ 
            baseDir:  "./",
            routes: {
                "/files": "files"
            }, 
            index: "Views/index.html"
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
                .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
                .pipe(sourcemaps.write('./maps'))
                .pipe(gulp.dest('files/css'))
                .pipe(browserSync.stream({match: '**/*.css'}));
        });
        es.merge(tasks).on('end', done);
    });
});
gulp.task('build', ['injectcss', 'html', 'image'], function(done){
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
            .transform(require('browserify-css'), {
                rootDir: '.',

                autoInject: 'true',
                minify: 'true'
            })
            .plugin(watchify);
        var bundle = function() {
            return b.bundle()
                .on('error', function(e){
                    gutil.log(e);
                })
                .pipe(source(entry))
                .pipe(streamify(uglify()))
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
        port: 3015,
        server:{ 
            baseDir:  "dist",
            routes: {
                "/files": "files"
            }, 
            index: "Views/index.html"
        },
        logFileChanges: false
    });
});
gulp.task('injectcss', function(done){
    function transformFilepath(filepath) {
        return "require('" + filepath + "');";
    }
    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:app',
        endtag: '// endinject',
        addRootSlash: false
    };
    glob('files/js/*.js', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            var injectAppFiles = gulp.src(entry, { base: process.cwd() })
                .pipe(rename({
                    dirname: "../css",
                    extname: ".css"
                }));
            gulp.src(entry)
                .pipe(inject(injectAppFiles, injectAppOptions))
                .pipe(gulp.dest('files/js'))
                .pipe(browserSync.stream({match: '**/*.js'}));
            var b = browserify(entry)
                .transform(require('browserify-css'), {
                    rootDir: '.',
                    autoInject: 'true',
                    minify: 'true'
                });
            function bundle (bundler) {   
                return bundler
                    .bundle()
                    .on('error', function(e){
                        gutil.log(e);
                    })
                    .pipe(source(entry))
                    .pipe(gulp.dest('dist'))
                    .pipe(browserSync.stream());
            }
            return bundle(b);
        });
        es.merge(tasks).on('end', done);
    });
});
/********** minify html **********/
gulp.task('html', ['html:watch'], function() {
    return gulp.src('./Views/*.html')
        .pipe(htmlreplace({
            'css': '',
            'js' : {
                src: '../files/js',
                tpl: '<script src="%s/%f.js"></script>'
            }
        }, {
            keepBlockTags: true
        }
        ))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/Views'));
});
/********** minify image **********/
gulp.task('image', function() {
    gulp.src('./files/img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/files/img'));
});
/********** watch sass **********/
gulp.task('sass:watch', function () {
    gulp.watch('files/sass/*.scss', ['injectsass'])
        .on('log', gutil.log);
});
/********** watch html **********/
gulp.task('html:watch', function () {
    gulp.watch('Views/*.html', ['html'])
        .on('log', gutil.log);
    reload();
});
