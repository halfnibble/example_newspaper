const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const eslint = require('gulp-eslint')
const rollup = require('gulp-better-rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const browserSync = require('browser-sync').create()
const json = require('rollup-plugin-json')
const auth = require('basic-auth')
const compare = require('tsscmp')
const axios = require('axios')
const creds = require('./../auth.json')
const apiToken = require('./../apiToken')

gulp.task('sass', () => {
    return gulp.src('./sass/main.sass')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream())
})

gulp.task('watch-sass-init', () => {
    gulp.watch([
        './sass/*.sass',
        './sass/*.scss',
        './sass/*.css'
    ], gulp.series('sass'))
})

gulp.task('watch-sass', gulp.series(['sass', 'watch-sass-init']))

gulp.task('lint', () => {
    return gulp.src('./js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('rollup', () => {
    return gulp.src('./js/start.js')
    .pipe(rollup({
        plugins: [
            json(),
            resolve({
                jsnext: true,
                main: true,
                module: true
            }),
            commonjs({
                include: './node_modules/**',
                browser: true
            }),
            babel({
                exclude: './node_modules',
                presets: [
                    '@babel/preset-env'
                ]
            })    
        ]
    }, {
        format: 'iife',
        file: 'main.js'
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('watch-js', () => {
    gulp.watch([
        './js/*.js'
    ], gulp.series('lint', 'rollup')).on('change', browserSync.reload)
})

const check = (name, pass) => {
    if (creds[name] && compare(pass, creds[name])) {
        return true
    }
    return false
}

gulp.task('default', gulp.parallel(() => {
    browserSync.init({
        server: './',
        port: 8080,
        middleware: [
            {
                route: "/api/login",
                handle: function (req, res, next) {
                    const credentials = auth(req)
                    if (credentials && check(credentials.name, credentials.pass)) {
                        res.end(JSON.stringify({
                            status: 'SUCCESS'
                        }))
                    } else {
                        res.end(JSON.stringify({
                            status: 'ERROR'
                        }))
                    }
                }
            },
            {
                route: "/api/form",
                handle: function (req, res, next) {
                    const credentials = auth(req)
                    let jsonData = null
                    let jsonString = ''
                    req.on('data', (data) => {
                        jsonString += data
                    });
                    req.on('end', function() {
                        jsonData = JSON.parse(jsonString);
                        if (credentials && check(credentials.name, credentials.pass)) {
                            axios.post(
                                'https://api-uswest.graphcms.com/v1/cjvx3xdjrb7px01ghu7z3xxtf/master',
                                jsonData,
                                {
                                    headers: {
                                        Authorization: `Bearer ${apiToken}`
                                    }
                                }
                            ).then((response) => {
                                if (response.data.errors) {
                                    console.log(response.data.errors)
                                    res.end(JSON.stringify({
                                        status: 'ERROR',
                                        reason: 'Bad request: ' + response.data.errors[0].message
                                    }))
                                } else {
                                    res.end(JSON.stringify({
                                        status: 'SUCCESS'
                                    }))
                                }
                            }).catch((error) => {
                                console.log(error)
                                res.end(JSON.stringify({
                                    status: 'ERROR',
                                    reason: 'Bad request.'
                                }))
                            })
                        } else {
                            res.end(JSON.stringify({
                                status: 'ERROR',
                                reason: 'Invalid credentials.'
                            }))
                        }
                    });
                }
            }
        ]
    })
}, 'watch-sass', 'watch-js'))








