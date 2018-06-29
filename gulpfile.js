import gulp from 'gulp'
import less from 'gulp-less'
import path from 'path'

gulp.task('less', function () {
    return gulp.src('./src/renderer/less/*.less')
      .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
      }))
      .pipe(gulp.dest('./static/css'))
  });