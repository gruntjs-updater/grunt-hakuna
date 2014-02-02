'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var filesMatchTest = function(test, tmp, fixtures) {
  grunt.file.recurse(fixtures, function(abspath, rootdir, subdir, filename){
    var file = filename;
    if (subdir) {
      file = subdir + '/' + file;
    }

    var actualExists = grunt.file.exists(tmp + file);
    test.ok(actualExists, tmp + file + ' does not exist.');

    if(actualExists) {
      var actual   = grunt.file.read(tmp + file);
      var expected = grunt.file.read(fixtures + file);

      test.equal(actual, expected, 'The content of ' + tmp + file + ' is not correct.');
    }
  });

  test.done();

};

exports.hakuna = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    filesMatchTest(test, 'tmp/default_options/', 'test/expected/default_options/');
  },
};
