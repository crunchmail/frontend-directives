var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-if': 'gulpif',
        'gulp-angular-gettext': 'gettext'
    }
});

gulp.task("serve", ["docs", "watch"], function() {
    plugins.connect.server({
        root: "./docs",
        port: "4002"
    });
});
