'use strict';

import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import replace from 'gulp-replace';
import sourcemaps from 'gulp-sourcemaps';

// CLEAN

gulp.task('clean-sw', () => {
  return del('public/bin/*');
});

gulp.task('clean-modules', () => {
  return del('public/modules/*');
});

gulp.task('clean-server', () => {
  return del('bin/*');
});


// BUILD

gulp.task('build-sw', ['clean-sw'], () => {
  return gulp.src('public/src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015-native-generators'],
      babelrc: false
    }))
    .pipe(concat('service-worker.js'))
    .pipe(replace('<% VERSION %>', new Date().toISOString()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/bin'));
});

gulp.task('build-modules', ['clean-modules'], () => {
  return gulp.src('public/modules-src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015-native-generators'],
      plugins: ['transform-es2015-modules-systemjs'],
      babelrc: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/modules'));
});

gulp.task('build-server', ['clean-server'], () => {
  return gulp.src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015-native-generators'],
      plugins: ['add-module-exports'],
      babelrc: false
    }))
    .pipe(sourcemaps.write('.', {sourceRoot: '../src'}))
    .pipe(gulp.dest('bin'));
});

gulp.task('build', ['build-sw', 'build-modules', 'build-server'], () => {})

// WATCH

gulp.task('watch-sw', ['build-sw'], () => {
  return gulp.watch('public/src/*.js', ['build-sw']);
});

gulp.task('watch-modules', ['build-modules'], () => {
  return gulp.watch('public/modules-src/*.js', ['build-modules']);
});

gulp.task('watch-server', ['build-server'], () => {
  return gulp.watch('src/*.js', ['build-server']);
});

gulp.task('watch', ['watch-sw', 'watch-modules', 'watch-server'], () => {});