'use strict';

var gulp = require('gulp');

gulp.task('watch', function() {
    gulp.watch([
        '**/*.js',
        'static_docs/*.ngdoc',
        '!.git/**',
        '!docs/**',
        '!node_modules/**'
    ], ['docs']);
});
