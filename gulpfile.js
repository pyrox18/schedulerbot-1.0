let gulp = require('gulp');
let exec = require('child_process').exec;

gulp.task("default", function(done) {
  exec('tsc', function(err, stdout, stderr) {
    console.log(stdout);
    if (err) done(err);
    else done();
  });
});