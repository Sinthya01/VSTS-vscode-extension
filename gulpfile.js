'use strict';

var gulp  = require('gulp'),
    mocha = require('gulp-mocha'),
    gutil = require('gulp-util');
var exec  = require('child_process').exec;
var tslint = require('gulp-tslint');

gulp.task('ts-lint-src', function () {
    return gulp.src(['./src/**/*.ts']).pipe(tslint()).pipe(tslint.report('prose', { emitError: false}));
});

gulp.task('ts-lint-test', function () {
    return gulp.src(['./test/**/*.ts']).pipe(tslint()).pipe(tslint.report('prose', { emitError: false}));
});

gulp.task('build', ['ts-lint-src', 'ts-lint-test'], function (cb) {
  exec('node ./node_modules/vscode/bin/compile', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('test', ['build'], function() {
    return gulp.src(['out/test/**/*.js'], {read: false})
    .pipe(mocha({reporter: 'list'}))
    .on('error', gutil.log); 
});

gulp.task('package', ['test'], function (cb) {
  exec('vsce package', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('all', ['package']);

gulp.task('default', ['build']);
