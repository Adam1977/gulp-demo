const gulp = require('gulp')
const gulpLess = require('gulp-less')
const gulpRename = require('gulp-rename')
const gulpCached = require('gulp-cached')
const Fse = require('fs-extra')

const devTasks = ['clean', 'less', 'file']
const watchTasks = ['less:watch', 'file:watch']

const SRC = './src'
const DIST = './dist'

// watch
gulp.task('less:watch', () => {
  gulp
    .watch([`${SRC}/**/*.less`], { delay: 200 })
    .on('change', (e) => {
      console.log('changed file:', e)
      let msg = 'start incremental compiling...'
      if (new RegExp(`${SRC}/.*_.+\\.less`).test(e)) {
        msg = 'start full compiling...'
        delete gulpCached.caches['less']
      }
      console.log(msg)
      gulp.series(['less'])()
    })
    .on('add', (e) => {
      console.log('a new file added:', e)
      gulp.series(['less'])()
    })
})

gulp.task('file:watch', () => {
  return gulp.watch(
    [
      `${SRC}/**`,
      `${SRC}/**/*.*`,
      `!${SRC}/**/*.less`
    ],
    gulp.series(['file'])
  )
})

gulp.task('clean', () => {
  return Fse.emptyDir(DIST)
})

gulp.task('file', () => {
  return gulp.src([`${SRC}/**/*.*`, `!${SRC}/**/*.less`]).pipe(gulp.dest(DIST))
})

gulp.task('less', () => {
  return gulp
    .src(`${SRC}/**/*.less`)
    .pipe(gulpCached('less'))
    .pipe(gulpLess())
    .pipe(
      gulpRename((p) => {
        p.extname = '.wxss'
      })
    )
    .pipe(gulp.dest(DIST))
})

gulp.task('dev', gulp.series(devTasks, gulp.parallel(watchTasks)))
