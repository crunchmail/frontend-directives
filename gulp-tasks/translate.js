var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-angular-gettext': 'gettext',
        'gulp-tag-version': 'tag_version'
    }
});

/**
* Gather application terms available for translation
* This is meant to be executed manually because it modifies files that are checked out
*/
gulp.task('gettext', function () {
    return gulp.src([
        '!gulpfile.js',
        '!node_modules/**/*',
        '**/*.html',
        '**/*.js'])
        .pipe(plugins.gettext.extract('template.pot', {
            attributes: ['placeholder', 'cm-confirm']
        }))
        .pipe(gulp.dest('lang/'));
});
