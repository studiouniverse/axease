var gulp = require('gulp'),
uglify = require("gulp-uglify"),
concat = require("gulp-concat");

var version = "0.3";

var paths = {
  input_vanilla: 'src/axease.js',
  input_solo: [
    'src/solo.js',
    'src/axease.js'
  ]
};

gulp.task('compile-js', function () {
  gulp.src(paths.input_vanilla) // path to your file
  .pipe(concat('axease.' + version + '.js'))
  .pipe(uglify())
  .pipe(gulp.dest('build').on('error', console.error.bind(console)));
});

gulp.task('compile-solo-js', function () {
  gulp.src(paths.input_solo) // path to your file
  .pipe(concat('axease.solo.' + version + '.js'))
  .pipe(uglify())
  .pipe(gulp.dest('build').on('error', console.error.bind(console)));
});

gulp.task('watch-js', function() {
  gulp.watch(paths.input_vanilla, ['compile-js']);
});

gulp.task('watch-solo-js', function() {
  gulp.watch(paths.input_solo, ['compile-solo-js']);
});

gulp.task('default', ['watch-js', 'compile-js']);
gulp.task('solo', ['watch-solo-js', 'compile-solo-js']);
