const gulp = require('gulp')
const less = require('gulp-less')
const path = require('path')
const gulpPrint = require('gulp-print').default
const babel = require('gulp-babel')
const replace = require('gulp-replace')
const fs = require('fs')
// const aliases = require('test/webpackTestAliases.js')

//compile less
gulp.task('less', function () {
    return gulp.src('./src/renderer/less/views/*.less')
        .pipe(gulpPrint())
        .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./static/css'))
})

gulp.task('compile-tests', function () {
    const aliases = {
        '@modules': path.join(__dirname, '../src/modules'),
        '@helpers': path.join(__dirname, '../src/modules/helpers'),
        '@constants': path.join(__dirname, '../src/constants'),
        '@app': path.join(__dirname, '../src/app'),
        '@models': path.join(__dirname, '../src/models'),
        '@ipc': path.join(__dirname, '../src/modules/ipc'),
        '@src': path.join(__dirname, '../src'),
        '@views': path.join(__dirname, '../src/renderer/components'),
        '@viewmodels': path.join(__dirname, '../src/viewModels')
    }

    const testPaths = './test/'
    const testDest = path.join(testPaths, 'compiledTests')
    // const webpackTestAliases = path.join(testPaths, 'webpackTestAliases.json')
    const specs = path.join(testPaths, '/specs/')

    // const aliasObject = JSON.parse(fs.readFileSync(webpackTestAliases, {encoding: 'utf-8'}))

    //set aliases paths
    // var aliases = {}
    // for(let alias in aliases) {
    //     const aliasValue = aliasObject[alias]
    //
    //     aliases[alias] = path.join(__dirname, aliasValue)
    // }

    return gulp.src(path.join(specs, '*.js'))
        .pipe(replace(/import(.+)from(.*)/g, function (match) {
            const splited = match.split('\/')
            var modifitedMatch = ''

            for(let str in splited) {
                if(str.test(/@(.*)/g)) { //has defined alias

                } else { //do not contain alias
                    match += str //append original path piece
                }
            }

            return modifitedMatch
        }))
        .pipe(babel({preset: ['es2015']}))
        .pipe(gulp.dest(testDest))
})

// gulp.task('compileWorkers', function () {
//     //compile workers to es5
//     //this will make workers aviable in separated processes
//     //via renderer
//     return gulp.src(
//         [
//             './src/modules/helpers/epubHelper.js'
//         ])
//         .pipe(babel({presets: ['es2015']}))
//         .pipe(gulp.dest('./src/workers'))
// })