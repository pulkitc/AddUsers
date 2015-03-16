var gulp = require('gulp')
  , nodemon = require('gulp-nodemon')
  , jshint = require('gulp-jshint')
 
gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})
 
gulp.task('serve', function () {
  nodemon({ script: 'index.js', ext: 'html js css' })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('server restarting!')
    })
})

gulp.task('default',['serve']);
