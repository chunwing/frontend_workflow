var 
<!-- build:proj -->
<!-- endbuild -->
gulp = require('gulp'),
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
jshint = require('gulp-jshint'),
template = require('gulp-template'),
browserSync = require('browser-sync').create(),
reload = browserSync.reload;

gulp.task('p', ['create:views'], function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src('gulpfile.js')
        .pipe(htmlreplace({
            'proj': "base = '" + option + "',"
        }, {
            keepBlockTags: true
        }
        ))
        .pipe(gulp.dest('./'));
});
gulp.task('create:views', ['create:files:js'], function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src(['.ini/Views/default/*', '!.ini/Views/default/*.html'], { base: process.cwd() })
        .pipe(rename({
            dirname: option
        }))
        .pipe(gulp.dest('Views'));
});
gulp.task('create:files:js', ['create:files:sass', 'create:files:img'], function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src(['.ini/files/default/js/*'], { base: process.cwd() })
        .pipe(rename({
            dirname: option + '/js'
        }))
        .pipe(gulp.dest('files'));
});
gulp.task('create:files:sass', function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src(['.ini/files/default/sass/*'], { base: process.cwd() })
        .pipe(rename({
            dirname: option + '/sass'
        }))
        .pipe(gulp.dest('files'));
});
gulp.task('create:files:img', function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src(['.ini/files/default/img/*'], { base: process.cwd() })
        .pipe(rename({
            dirname: option + '/img'
        }))
        .pipe(gulp.dest('files'));
});

gulp.task('t', ['create:js', 'create:scss'], function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src('.ini/Views/default/default.html')
        .pipe(template({
            name: option,
            dir: base
        }))
        .pipe(rename({
            basename: option 
        }))
        .pipe(gulp.dest('Views/' + base));
});
gulp.task('create:js', function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src('.ini/files/default/js/views/default.js')
        .pipe(rename({
            basename: option 
        }))
        .pipe(gulp.dest('files/' + base + '/js/views'));

});
gulp.task('create:scss', function(){
    var option, i = process.argv.indexOf("--c");
    if(i>-1) {
        option = process.argv[i+1];
    }
    gulp.src('.ini/files/default/sass/views/default.scss')
        .pipe(rename({
            basename: option 
        }))
        .pipe(gulp.dest('files/' + base + '/sass/views'));
});

/**** develop project *****/
gulp.task('d', ['scss', 'html:watch'], function(done){
    var option, i = process.argv.indexOf("--w");
    if(i>-1) {
        option = process.argv[i+1];
    }
    function transformFilepath(filepath, file) {
        return "require('../" + filepath.slice(-13) + "');";
    }
    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:js',
        endtag: '// endinject',
        addRootSlash: false
    };
    glob('files/' + base + '/js/views/*.js', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            gulp.src(entry)
                .pipe(htmlreplace({
                    'css': '\n// inject:app\n// endinject\n'
                }, {
                    keepBlockTags: true
                }
                ))
                .pipe(inject(gulp.src('files/' + base + '/js/initialize.js', {read: false}), injectAppOptions))
                .pipe(jshint())
                .pipe(jshint.reporter('default'))
                .pipe(gulp.dest('files/' + base + '/js/views'));
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
            baseDir:  './',
            routes: {
                '/files': 'files'
            }, 
            index: 'Views/' + base + '/' + option + '.html'
        },
        logFileChanges: false
    });
});
/**** build project *****/

gulp.task('b', ['css', 'html', 'image'], function(done){
    var option, i = process.argv.indexOf("--w");
    if(i>-1) {
        option = process.argv[i+1];
    }
    glob('files/' + base + '/js/views/*.js', function(err, files){
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
            baseDir:  'dist',
            routes: {
                '/files': 'files'
            }, 
            index: 'Views/' + base + '/' + option + '.html'
        },
        logFileChanges: false
    });
});
/**** compile scss *****/
gulp.task('scss', ['scss:watch'], function(done){
    function transformFilepath(filepath) {
        return '@import "' + filepath + '";';
    }
    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:scss',
        endtag: '// endinject',
        addRootSlash: false
    };
    glob('files/' + base + '/sass/views/*.scss', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            return gulp.src(entry)
                .pipe(inject(gulp.src('files/' + base + '/sass/initialize.scss', {read: false}), injectAppOptions))
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
                .pipe(sourcemaps.write('./maps'))
                .pipe(gulp.dest('files/' + base + '/css/views'))
                .pipe(browserSync.stream({match: '**/views/*.css'}));
        });
        es.merge(tasks).on('end', done);
    });
});
/**** inject css & bundle *****/
gulp.task('css', ['scss'], function(done){
    function transformFilepath(filepath) {
        return "require('" + filepath + "');";
    }
    var injectAppOptions = {
        transform: transformFilepath,
        starttag: '// inject:app',
        endtag: '// endinject',
        addRootSlash: false
    };
    glob('files/' + base + '/js/views/*.js', function(err, files){
        if (err) done(err);
        var tasks = files.map( function(entry){
            var injectAppFiles = gulp.src(entry, { base: process.cwd() })
                .pipe(rename({
                    dirname: "../../css/views",
                    extname: ".css"
                }));
            gulp.src(entry)
                .pipe(inject(injectAppFiles, injectAppOptions))
                .pipe(gulp.dest('files/' + base + '/js/views'))
                .pipe(browserSync.stream({match: '**/views/*.js'}));
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
/**** minify html *****/
gulp.task('html', function() {
    return gulp.src('./Views/' + base + '/**/*.html')
        .pipe(htmlreplace({
            'css': '',
            'js' : {
                src: '../../files/' + base + '/js/views',
                tpl: '<script src="%s/%f.js"></script>'
            }
        }, {
            keepBlockTags: true
        }
        ))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/Views/' + base));
});
/**** minify image ****/
gulp.task('image', function() {
    gulp.src('./files/' + base + '/img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/files/' + base + '/img'));
});
/**** watch scss ****/
gulp.task('scss:watch', function () {
    gulp.watch('files/' + base + '/sass/views/**/*.scss', ['scss'])
        .on('log', gutil.log);
});
/**** watch html ****/
gulp.task('html:watch', function () {
    gulp.watch('Views/' + base + '/**/*.html')
        .on('log', gutil.log)
        .on('change', reload);
});
