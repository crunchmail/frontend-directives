var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-angular-gettext': 'gettext',
        'gulp-tag-version': 'tag_version'
    }
});

gulp.task('docs', function () {
    var options = {
        html5Mode: false,
        startPage: '/api'
    };
    return plugins.ngdocs.sections({
        api: {
            glob: [
                '**/*.js',
                'static_docs/*.ngdoc',
                '!.git/**',
                '!docs/**',
                '!node_modules/**'
            ],
            api: true,
            title: 'API Documentation'
        }
    }).pipe(plugins.ngdocs.process(options))
    .pipe(gulp.dest('./docs'));
});

gulp.task('deploy', ['docs'], function() {
  return gulp.src('./docs/**/*')
    .pipe(plugins.ghPages());
});
