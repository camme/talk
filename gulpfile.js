var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    var test = gutil.env.test || '';
    return gulp.src('test/**/*' + test + '.spec.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});
