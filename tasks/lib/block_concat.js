/*
* grunt-block-concat
* https://github.com/carols10cents/grunt-block-concat
*
* Copyright (c) 2014 Carol Nichols and Rob Wierzbowski
* Licensed under the MIT license.
*/

'use strict';
var path = require('path');

exports.init = function(grunt) {
  var exports = {};

  exports.processHTML = function(htmlFile, outputDirectory) {

    var inputDirectory = path.dirname(htmlFile);

    var output = '';
    var htmlparser = require("htmlparser2");

    var state = '';
    var concatFilename;
    var concatFile = '';
    var files = [];

    var parser = new htmlparser.Parser({
      oncomment: function(data){
        if(state === '' && data.match(/build/)) {
          state = 'inside';
          concatFilename = data.match(/build ([^ ]*)/)[1];

        } else if(state !== '' && data.match(/\/build/)) {

          if(state === 'script') {
            output += '<script type="text/javascript" src="' + concatFilename + '"></script>';
          } else if(state === 'link') {
            output += '<link rel="stylesheet" href="' + concatFilename + '"></link>';
          }

          files.forEach(function (f){
            concatFile += grunt.file.read(path.join(inputDirectory, f)) + "\n\n";
          });

          grunt.file.write(path.join(outputDirectory, concatFilename), concatFile.trim());

          files = [];
          state = '';
          concatFile = '';
        } else {
          output += data;
        }
      },
      onopentag: function(name, attribs){
        if(name === "script" && attribs.type === "text/javascript") {
          if (state !== '') {
            state = name;
            files.push(attribs.src);
          } else {
            grunt.file.write(path.join(outputDirectory, attribs.src), grunt.file.read(path.join(inputDirectory, attribs.src)));
            output += toTag(name, attribs);
          }
        } else if (name === "link" && attribs.rel === 'stylesheet') {
          if (state !== '') {
            state = name;
            files.push(attribs.href);
          } else {
            grunt.file.write(path.join(outputDirectory, attribs.href), grunt.file.read(path.join(inputDirectory, attribs.href)));
            output += toTag(name, attribs);
          }
        } else {
          output += toTag(name, attribs);
        }
      },
      ontext: function(text){
        if (state === '') {
          output += text;
        }
      },
      onclosetag: function(tagname){
        if((tagname.match(/^(script|link)$/) && state === '') || !tagname.match(/^(script|link)$/)){
          output += '</' + tagname + ">";
        }
      }
    });
    parser.write(grunt.file.read(htmlFile));
    parser.end();

    return output;
  }

  var toTag = function(name, attribs) {
    var tag = '<';
    tag += name;
    for (var key in attribs) {
      tag += ' ';
      tag += key;
      tag += '="' + attribs[key] + '"';
    }
    tag += '>';
    return tag;
  }

  return exports;
};
