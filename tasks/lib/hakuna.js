/*
* grunt-hakuna
* https://github.com/carols10cents/grunt-hakuna
*
* Copyright (c) 2014 Carol Nichols and Rob Wierzbowski
* Licensed under the MIT license.
*/

'use strict';
var path = require('path');

exports.init = function(grunt) {
  var exports = {};

  var state = '';

  exports.processHTML = function(inputHTML, inputDirectory, outputDirectory) {

    var output = '';
    var htmlparser = require("htmlparser2");

    var concatFilename;
    var files = [];

    // This parser operates as a sort of state machine. As we get to various
    // parts of the HTML that we're processing, we do different things based
    // on if we're within a build block or not and based on what we have just
    // encountered.
    var parser = new htmlparser.Parser({
      oncomment: function(data){
        if(outsideABlock() && startingBlockComment(data)) {
          // Start of a block comment

          enterBlock();
          concatFilename = filenameFromBlockComment(data);

        } else if(withinABlock() && endingBlockComment(data)) {
          // End of a block comment

          if(withinAJavaScriptBlock()) {
            output += javascriptTagFor(concatFilename);
          } else if(withinACssBlock()) {
            output += cssTagFor(concatFilename);
          }

          concatFiles(files, concatFilename, inputDirectory, outputDirectory);

          files = [];
          exitBlock();

        } else {
          // Not a block comment - pass through unscathed whether we're in a
          // block or not
          output += toComment(data);
        }
      },
      onopentag: function(name, attribs){
        if(javascriptOrStylesheetTag(name, attribs)) {
          if (withinABlock()) {
            // Instead of parsing the block comment filename to figure out the
            // kind of block we're in, rely on the tags within a block to tell
            // us. Mixing CSS and JS within one block is invalid, so it doesn't
            // matter that we're overwriting the stored block type every time
            // we encounter a tag within a block.
            updateBlockType(name);
            addFilenameToConcatList(files, attribs);
          } else {
            // It's valid to have javascript or css that isn't in a block--
            // pass their tags and file contents through unscathed.
            transferFileAsIs(attribs, inputDirectory, outputDirectory);
            output += toTag(name, attribs);
          }
        } else {
          // Not a javascript or css tag - pass through unscathed whether we're
          // in a block or not.
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
      onclosetag: function(name){
        // Tags we're interested in modifying, we'll take care of closing
        // elsewhere. Tags we're not modifying should get closed here.
        var jsOrCss = javascriptOrStylesheetClosingTag(name);
        if( (jsOrCss && outsideABlock()) || !jsOrCss ) {
          output += toClosingTag(name);
        }
      }
    });
    parser.write(inputHTML);
    parser.end();

    return output;
  };

  var startingBlockComment = function(data) {
    return data.match(/[^\/]build/);
  };

  var endingBlockComment = function(data) {
    return data.match(/\/build/);
  };

  var filenameFromBlockComment = function(data) {
    return data.match(/build ([^ ]*)/)[1];
  };

  // withinABlock should be the opposite of outsideABlock.
  var withinABlock = function() {
    return state !== ''
  };

  var outsideABlock = function() {
    return state === ''
  };

  var withinAJavaScriptBlock = function() {
    return state === 'script';
  };

  var withinACssBlock = function() {
    return state === 'link';
  };

  var enterBlock = function() {
    state = 'unknownTypeUntilWeSeeWhatLiesWithin';
  };

  var updateBlockType = function(blockType) {
    state = blockType;
  };

  var exitBlock = function() {
    state = '';
  };

  var addFilenameToConcatList = function(files, attribs) {
    if (attribs.src) {
      files.push(attribs.src);
    } else if (attribs.href) {
      files.push(attribs.href);
    }
  };

  var transferFileAsIs = function(attribs, inputDirectory, outputDirectory) {
    var name = '';
    if (attribs.src) {
      name = attribs.src;
    } else if (attribs.href) {
      name = attribs.href;
    }

    var inputFilename = path.join(inputDirectory, name);
    var outputFilename = path.join(outputDirectory, name);

    grunt.file.write(outputFilename, grunt.file.read(inputFilename));
  };

  var concatFiles = function(files, concatFilename, inputDirectory, outputDirectory) {
    var concatFileContents = [];

    files.forEach(function (name) {
      var inputFilename = path.join(inputDirectory, name);
      concatFileContents.push(grunt.file.read(inputFilename));
    });

    var outputFilename = path.join(outputDirectory, concatFilename);
    var separator = "\n\n";
    grunt.file.write(outputFilename, concatFileContents.join(separator));
  };

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
  };

  var toClosingTag = function(name) {
    return '</' + name + '>';
  };

  var toComment = function(data) {
    return '<!--' + data + '-->';
  };

  var javascriptTagFor = function(concatFilename) {
    return toTag('script', {
                  type: 'text/javascript',
                  src:  concatFilename
                }) + toClosingTag('script');
  };

  var cssTagFor = function(concatFilename) {
    return toTag('link', {
                  rel:  "stylesheet",
                  href: concatFilename
                }) + toClosingTag('link');
  };

  var javascriptOrStylesheetTag = function(name, attribs) {
    return (name === "script" && attribs.type === "text/javascript") || (name === "link" && attribs.rel === 'stylesheet');
  };

  var javascriptOrStylesheetClosingTag = function(name) {
    return name.match(/^(script|link)$/);
  };

  return exports;
};
