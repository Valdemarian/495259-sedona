"use strict";

var gulp = require("gulp");
var wait = require("gulp-wait");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var ghPages = require('gulp-gh-pages');
var server = require("browser-sync").create();
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var rename = require('gulp-rename');

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(wait(100))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task('deploy', function() {
  return gulp.src([
      'source/**/*',
      '!source/sass/**/*',
      '!source/**/README',
    ])
    .pipe(ghPages());
});

gulp.task('svg:sprite', function() {
  return gulp.src('source/img/svg-sprite/*.svg')
  .pipe(svgmin(function (file) {
    return {
      plugins: [{
        cleanupIDs: {
          minify: true
        }
      }]
    }
  }))
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(cheerio({
    run: function($) {
      $('svg').attr('style',  'display:none');
    },
    parserOptions: {
      xmlMode: true
    }
  }))
  .pipe(rename('sprite-svg.svg'))
  .pipe(gulp.dest('source/img/'))
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });


  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch("source/img/svg-sprite/*.svg", ["svg:sprite"]);
});
