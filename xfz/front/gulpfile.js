

var gulp = require("gulp");
var cssnano = require("gulp-cssnano");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var bs = require("browser-sync");
var sass = require("gulp-sass");
var util = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");


var path = {
    'html': './templates/**/',
    'css': './src/css/**/',
    'js': './src/js/',
    'images': './src/images/',
    'css_dist': './dist/css/',
    'js_dist': './dist/js/',
    'images_dist': './dist/images/'
};

gulp.task("html",function(done){
    gulp.src(path.html + '*.html')
        .pipe(bs.stream())
        done();
})

// css任务
gulp.task("css",function(done){
    gulp.src(path.css + "*.scss")
        .pipe(sass().on("error",sass.logError))
        .pipe(cssnano())
        .pipe(rename({"suffix": ".min"}))
        .pipe(gulp.dest(path.css_dist))
        .pipe(bs.stream())
        done();
})

gulp.task("js",function(done){
    gulp.src(path.js + "*.js")
        .pipe(sourcemaps.init())
        .pipe(uglify().on("error",util.log))
        .pipe(rename({"suffix": ".min"}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.js_dist))
        .pipe(bs.stream())
        done();
});

gulp.task('images',function (done) {
    gulp.src(path.images = "*.*")
        .pipe(cache(imagemin()))
        .pipe(gulp.dest(path.images_dist))
        .pipe(bs.stream())
        done()
});

gulp.task("watch",function(done){
    gulp.watch(path.html + '*.html',gulp.series("html"));
    gulp.watch(path.css + '*.scss',gulp.series("css"));
    gulp.watch(path.js + '*.js',gulp.series("js"));
    gulp.watch(path.images + '*.*',gulp.series("images"));
});

//初始化browser-sync任务
gulp.task("bs",function (done) {
    bs.init({
        'server': {
            'baseDir': './'
        }
    });
    done();
});

// gulp.task("default",gulp.parallel("bs","watch"));
gulp.task("default",gulp.parallel("watch"));