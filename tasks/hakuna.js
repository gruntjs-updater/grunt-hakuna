/*
 * grunt-hakuna
 * https://github.com/carols10cents/grunt-hakuna
 *
 * Copyright (c) 2014 Carol Nichols and Rob Wierzbowski
 * Licensed under the MIT license.
 */

'use strict';
var path = require('path');

module.exports = function(grunt) {
  var hakuna = require('./lib/hakuna').init(grunt);


  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('hakuna', 'Concats files specified in blocks in HTML and replaces the reference to the new file. Uses an HTML parser rather than regex.', function() {

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

      src.forEach(function(htmlFile){
        var inputDirectory = path.dirname(htmlFile);
        var inputHTML = grunt.file.read(htmlFile);
        var outputHTML = hakuna.processHTML(
          inputHTML,
          inputDirectory,
          path.dirname(f.dest)
        );
        grunt.file.write(f.dest, outputHTML);
        grunt.log.writeln('File "' + f.dest + '" created.');
      });
    });
  });

};
