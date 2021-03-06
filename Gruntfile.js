/*
 * grunt-hakuna
 * https://github.com/carols10cents/grunt-hakuna
 *
 * Copyright (c) 2014 Carol Nichols and Rob Wierzbowski
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    hakuna: {
      default_options: {
        files: [{
          expand: true,
          cwd: 'test/fixtures/project1',
          src: '**/*.html',
          dest: 'tmp/default_options'
        }],
      },
      // Don't hate about my mixing camelcase and underscores. Think about it:
      // IT MAKES SENSE
      copyFiles_false: {
        options: {
          copyFiles: false,
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/project1',
          src: '**/*.html',
          dest: 'tmp/copyFiles_false'
        }],
      }
      // in_place: { // No dest
        // files: [{
        //   expand: true,
        //   cwd: 'test/fixtures/project1',
        //   src: '**/*.html',
        // }],
      // },
    },

    // Tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'hakuna', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
