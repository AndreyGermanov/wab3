var gulp = require('gulp'),
    concat = require('gulp-concat'),
    preprocess = require('gulp-preprocess'),
    fs = require('fs'),
    readline = require('readline'),
    readdirp = require('readdirp'),
    async = require('async'),
    react = require('gulp-react'),
    forever = require('gulp-forever-monitor');

gulp.task('classes', function() {
    var classes_array = {};
    var classes_files = [];
    var files = [];
    async.series([
        function(callback) {
            readdirp({root: 'lib/classes', fileFilter: '*.js'})
                .on('data', function (info) {
                    files.push(info.fullPath);
                })
                .on('end', function () {
                    async.eachSeries(files, function (file, each_callback) {
                            var rl = readline.createInterface({
                                input: fs.createReadStream(file)
                            });
                            rl.on('error', function (err) {
                                throw(err);
                            });
                            rl.on('line', function (line) {
                                var result = /Class\.create\(\'(.*)\'\,(.*)/.exec(line);
                                if (result) {
                                    var class_info = {
                                        name: result[1].trim(),
                                        path: file
                                    };
                                    if (result[2].trim() != '{') {
                                        class_info.parent = result[2].trim().split(',').shift().replace(/\)/g, '').replace(/\;/g, '');
                                    } else {
                                        class_info.parent = null;
                                    }
                                    ;
                                    classes_array[class_info.name] = class_info;
                                    rl.close();
                                    each_callback();
                                }
                            });
                        },
                        function (err) {
                            callback();
                        });
                });
        }],function(err) {
            function getParentTree(item) {
                var result = [item];
                if (item && classes_array[item].parent) {
                    var parents = getParentTree(classes_array[item].parent);
                    for (var o in parents) {
                        result.push(parents[o]);
                    }
                };
                return result;
            }
            var trees = [];
            var max_length = 0;
            for (var item in classes_array) {
                var arr = getParentTree(item).reverse();
                if (arr.length>max_length) {
                    max_length = arr.length;
                }
                trees.push(arr);
            };
            var classes_sequence = [];
            for (var i=0;i<max_length;i++) {
                for (var o in trees) {
                    if (trees[o][i] && !classes_sequence[trees[o][i]]) {
                        classes_sequence[trees[o][i]] = classes_array[trees[o][i]].path;
                        classes_files.push(classes_array[trees[o][i]].path);
                    }
                }
            }
            classes_files.unshift('lib/oop.js');
            gulp.src(classes_files).pipe(preprocess({context: {MODE: 'CLIENT'}})).pipe(concat('classes.js')).pipe(gulp.dest('public/js'));
        }
    )
});

gulp.task('templates', function() {
   gulp.src(['templates/*.jsx']).pipe(react()).pipe(concat('templates.js')).pipe(gulp.dest('public/js'));
});

gulp.task('run:server', function() {
    var foreverMonitorOptions = {
        env: process.env,
        args: process.argv,
        watch: true, // can pass if you set any watch option, for example watchIgnorePatterns
        watchIgnorePatterns:  ['.*', 'node_modules/**', 'public/**', 'temp/**']
    }

    forever('index.js', foreverMonitorOptions)
        .on('watch:restart', function(fileInfo) {
            console.log('server was restarted');
        })
        .on('exit', function() {
            console.log('server was closed');
        })
})

gulp.task('vendor', function() {
    gulp.src(['bower_components/jquery/dist/jquery.min.js']).pipe(concat('vendor.js')).pipe(gulp.dest('public/js'));
})

gulp.task('watch', function() {
    gulp.watch(['lib/*','lib/*/*.js','lib/*/*/*.js'],['classes']);
    gulp.watch(['templates/*'],['templates']);
})

gulp.task('default', ['watch', 'vendor', 'classes', 'templates', 'run:server'], function() {
    gulp.src(['index.js']).pipe(preprocess({context: {MODE: 'CLIENT'}})).pipe(concat('index.js')).pipe(gulp.dest('public/js'));
});

