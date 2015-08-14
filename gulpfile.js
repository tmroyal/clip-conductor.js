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
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var testServer;

var DEST = './dist';

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
function testsComplete(done){
  var err;
  return function(exitCode){
    if (exitCode > 0){
      err = new gutil.PluginError('test', 'Test runner reported '+exitCode+' error(s).');
    }
    done(err);
  }
}

function runTest(done){

  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, testsComplete(done)).start();
}

// included to attempt lint free test
gulp.task('freeTest', runTest);

gulp.task('test', ['lint'], runTest);

// lint runner

gulp.task('lint', function(){ 
  return gulp.src(['./src/**/*.js', '!./src/**/*_test.js'])
             .pipe(jshint())
             .pipe(jshint.reporter(stylish))
             .pipe(jshint.reporter('fail'));
});

gulp.task('watch', function(){
  watch('src/**/*.js', batch(function(events, done){
    gulp.start('compile', done);
  }));
});

gulp.task('default', ['compile']);

