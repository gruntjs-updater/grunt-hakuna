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
        if(outsideABlock() && data.match(/build/)) {
          state = 'inside';
          concatFilename = data.match(/build ([^ ]*)/)[1];

        } else if(withinABlock() && data.match(/\/build/)) {

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
          if (withinABlock()) {
            state = name;
            files.push(attribs.src);
          } else {
            grunt.file.write(path.join(outputDirectory, attribs.src), grunt.file.read(path.join(inputDirectory, attribs.src)));
            output += toTag(name, attribs);
          }
        } else if (name === "link" && attribs.rel === 'stylesheet') {
          if (withinABlock()) {
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
        // We want to get rid of whitespace within a block, which gets treated
        // as text content. So only transfer text when outside a block.
        if (outsideABlock()) {
          output += text;
        }
      },
      onclosetag: function(tagname){
        // Tags we're interested in modifying, we'll take care of closing
        // elsewhere. Tags we're not modifying should get closed here.
        if((tagname.match(/^(script|link)$/) && outsideABlock()) || !tagname.match(/^(script|link)$/)){
          output += '</' + tagname + ">";
        }
      }
    });
    parser.write(grunt.file.read(htmlFile));
    parser.end();

    return output;
  }

  var withinABlock = function() {
    return state !== ''
  }

  var outsideABlock = function() {
    return state === ''
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
