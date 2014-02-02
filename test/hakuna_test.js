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

var filesMatchTest = function(test, actualDirectory, expectedDirectory) {
  var actualFilesTested = [];

  // Test that, for each file that is in the directory of files expected, a
  // corresponding actual file exists with the same content.
  grunt.file.recurse(expectedDirectory, function(a, r, subdir, filename){
    var expectedFilename = filename;
    if (subdir) {
      expectedFilename = subdir + '/' + expectedFilename;
    }

    var expectedFilepath = expectedDirectory + expectedFilename;
    var actualFilepath   = actualDirectory + expectedFilename;

    actualFilesTested.push(actualFilepath);

    var actualExists = grunt.file.exists(actualFilepath);
    test.ok(actualExists, actualFilepath + ' does not exist.');

    if(actualExists) {
      var actual   = grunt.file.read(actualFilepath);
      var expected = grunt.file.read(expectedFilepath);

      test.equal(actual, expected, 'The content of ' + actualFilepath + ' is not correct.');
    }
  });

  // Test that there aren't any extra files in the actual directory that don't
  // exist in the expected directory.

  var extraFiles = grunt.file.expand(
    {
      filter: function(src) {
        return grunt.file.isFile(src) && actualFilesTested.indexOf(src) === -1;
      }
    },
    actualDirectory + '**/*'
  );

  test.equal(extraFiles.length, 0, 'These files exist in the actual output but are not expected: ' + extraFiles.join(', '));

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
