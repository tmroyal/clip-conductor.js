'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var karma = require('karma');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var gutil = require('gulp-util');

var DEST = './dist';

// ***************
// TODO setup file watching and auto browserifying
// with new main entrypoint
// ***************

// collect dependencies (browserify), and minifiy
// requires test task to be complete, which in turn
// requires lint task to be complete

gulp.task('compile', ['test'], function () {

  var b = browserify({
    entries: './src/main.js',
    debug: false
  });

  return b.bundle()
    .pipe(source('clipConductor.js'))
    .pipe(buffer())
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js'}))
    .pipe(gulp.dest(DEST));
});

// test runners

function runTest(done){
  function testsComplete(result){
    var err;
    if (result > 0){
      err = new gutil.PluginError('test', 'Test runner reported '+result+' error(s).');
    }
    done(err);
  }

  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, testsComplete).start();
}

gulp.task('test', ['lint'], runTest); 
// included to attempt lint free test
gulp.task('freeTest', runTest);

// lint runner

gulp.task('lint', function(){ 
  return gulp.src('./src/**/*.js')
             .pipe(jshint())
             .pipe(jshint.reporter(stylish))
             .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['compile']);
