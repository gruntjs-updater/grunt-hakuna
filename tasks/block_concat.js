/*
 * grunt-block-concat
 * https://github.com/carols10cents/grunt-block-concat
 *
 * Copyright (c) 2014 Carol Nichols and Rob Wierzbowski
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('blockConcat', 'Concats files specified in blocks in HTML and replaces the reference to the new file. Uses an HTML parser rather than regex.', function() {

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

    });
  });

};
