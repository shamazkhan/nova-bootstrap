//
// Gulpfile
//

"use strict";

const gulp                   = require('gulp');
const sass                   = require('gulp-sass');
const changed                = require('gulp-changed');
const autoprefixer           = require('gulp-autoprefixer');
const rename                 = require('gulp-rename');
const del                    = require('del');
const concat                 = require('gulp-concat');
const cleanCSS               = require('gulp-clean-css');
const uglify                 = require('gulp-uglifyjs');
const cache                  = require('gulp-cache');
const imagemin               = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant               = require('imagemin-pngquant');
const browsersync            = require('browser-sync').create();



//
// Gulp plumber error handler - displays if any error occurs during the process on your command
//

function errorLog(error) {
  console.error.bind(error);
  this.emit('end');
}



//
// SASS - Compile SASS files into CSS
//

function scss() {
  return gulp
    .src('./assets/include/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(gulp.dest('./assets/css/'))
    .on('error', sass.logError)
    .pipe(autoprefixer([
        "last 1 major version",
        ">= 1%",
        "Chrome >= 45",
        "Firefox >= 38",
        "Edge >= 12",
        "Explorer >= 10",
        "iOS >= 9",
        "Safari >= 9",
        "Android >= 4.4",
        "Opera >= 30"], { cascade: true }))
    .pipe(gulp.dest('./assets/css/'))
    .pipe(browsersync.stream());
}



//
// BrowserSync (live reload) - keeps multiple browsers & devices in sync when building websites
//

function browserSync(done) {
  browsersync.init({
    files: "./*.html",
    startPath: "./ui-components/widgets.html",
    server: {
      baseDir: "./",
      routes: {},
      middleware: function (req, res, next) {
        if (/\.json|\.txt|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
          console.log('[POST => GET] : ' + req.url);
          req.method = 'GET';
        }
        next();
      }
    }
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}



//
// Gulp Watch and Tasks
//

function watch() {
  gulp.watch('./assets/include/scss/**/*.scss', scss);
  gulp.watch(
    [
      './html/**/*.html',
      './starter/**/*.html',
      './documentation/**/*.html'
    ],
    gulp.series(browserSyncReload)
  );
}

// Gulp Tasks
gulp.task('default', gulp.parallel(watch, scss, browserSync));



//
// CSS minifier - merges and minifies the below given list of Space libraries into one theme.min.css
//

function minCSS() {
  return gulp
    .src([
      './assets/css/theme.css',
    ])
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/assets/css/'));
}



//
// JavaSript minifier - merges and minifies the below given list of Space libraries into one theme.min.js
//

function minJS() {
  return gulp
    .src([
      './assets/js/hs.core.js',
      './assets/js/components/**/*',
      './assets/js/theme-custom.js',
    ])
    .pipe(concat('theme.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/assets/js/'));
}



//
// Image minifier - compresses images
//

function minIMG() {
  return gulp
    .src('./assets/img/**/*')
    .pipe(cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality:'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: [.65, .7], speed: 5})
    ],{
      verbose: true
    })))
    .pipe(gulp.dest('./dist/assets/img/'));
}



//
// Copy Vendors - a utility to copy client-side dependencies into a folder
//

function copyVendors() {
  return gulp
    .src([
      './node_modules/@yaireo/*tagify/**/*.*',
      './node_modules/*animate.css/**/*',
      './node_modules/*chartist/**/*',
      './node_modules/*clipboard/**/*',
      './node_modules/*datatables/**/*',
      './node_modules/*datatables.net-buttons/**/*.*',
      './node_modules/*daterangepicker/**/*.*',
      './node_modules/*flatpickr/**/*',
      './node_modules/*ion-rangeslider/**/*',
      './node_modules/*jquery/**/*',
      './node_modules/*jquery-migrate/**/*',
      './node_modules/*jquery-validation/**/*',
      './node_modules/*jquery-mask-plugin/**/*.*',
      './node_modules/*jszip/**/*.*',
      './node_modules/*malihu-custom-scrollbar-plugin/**/*',
      './node_modules/*pdfmake/**/*.*',
      './node_modules/*popper.js/**/*',
      './node_modules/*select2/**/*.*',
      './node_modules/*summernote/**/*',
      './node_modules/*table-edits/**/*.*',
    ])
    .pipe(gulp.dest('./dist/assets/vendor/'))
};

gulp.task('minCSS', minCSS);
gulp.task('minJS', minJS);
gulp.task('minIMG', minIMG);
gulp.task('copyVendors', copyVendors);
gulp.task('dist', gulp.series(copyVendors, minCSS, minJS, minIMG));