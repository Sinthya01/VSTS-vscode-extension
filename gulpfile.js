'use strict';

var gulp  = require('gulp'),
    mocha = require('gulp-mocha'),
    gutil = require('gulp-util');
var exec  = require('child_process').exec;
var tslint = require('gulp-tslint');
var del = require('del');

function errorHandler(err) {
    console.error(err.message);
    process.exit(1);
}

gulp.task('tslint-src', function () {
    return gulp.src(['./src/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', { emitError: true}))
        .on('error', errorHandler);
});

gulp.task('tslint-test', function () {
    return gulp.src(['./test/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', { emitError: true}))
        .on('error', errorHandler);
});

gulp.task('clean', ['tslint-src', 'tslint-test'], function (done) {
    return del(['out/**', '!out', '!out/src/credentialstore/linux', '!out/src/credentialstore/osx', '!out/src/credentialstore/win32'], done);
});

gulp.task('build', ['clean'], function (cb) {
  exec('node ./node_modules/vscode/bin/compile', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('publishbuild', ['build'], function () {
    gulp.src(['./src/credentialstore/**/*.js'])
        .pipe(gulp.dest('./out/src/credentialstore'));
    gulp.src(['./src/credentialstore/bin/win32/*'])
        .pipe(gulp.dest('./out/src/credentialstore/bin/win32'));
});

//Tests will fail with MODULE_NOT_FOUND if I try to run 'publishBuild' before test target
//gulp.task('test', ['publishBuild'], function() {
gulp.task('test', function() {
    return gulp.src(['out/test/**/*.js'], {read: false})
    .pipe(mocha({reporter: 'list'}))
    .on('error', errorHandler);
});

gulp.task('packageonly', function (cb) {
  exec('vsce package', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('package', ['publishbuild'], function (cb) {
  exec('vsce package', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('default', ['package']);
