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

  exports.processHTML = function(params) {

    // Variable initialization/setup ===========================================

    var inputHTML       = params.inputHTML;
    var inputDirectory  = params.inputDirectory;
    var outputDirectory = params.outputDirectory;

    // Optionally handle the copying of js and css files from source to dest
    // as part of a concatenated file or as-is. There may be workflows where
    // you may want to manage this yourself, and it also makes it nicer to test
    // this function without worrying about side effects.
    // Default to true.
    var copyFiles = params.copyFiles === undefined ? true : params.copyFiles;

    var htmlparser = require("htmlparser2");

    var concatFilename;
    var files = [];

    var state = '';

    // This stores the end of an IE conditional comment that occurs within a
    // build block. Most of the time this will be empty string.
    var endConditionalComment = '';

    // Helper functions ========================================================

    var startingBlockComment = function(data) {
      return data.match(/^ *build/);
    };

    var endingBlockComment = function(data) {
      return data.match(/(\/build|endbuild)/);
    };

    var filenameFromBlockComment = function(data) {
      return data.match(/build[^ ]* ([^ ]*)/)[1];
    };

    var ieConditionalStartRegex = /(\[if.*\]>)/;
    var ieConditionalEndRegex = /(<!\[endif\])/;

    var wholeIeConditionalComment = function(data) {
      return data.match(ieConditionalStartRegex) && data.match(ieConditionalEndRegex);
    };

    var ieConditionalCommentStart = function(data) {
      return '<!--' + data.match(ieConditionalStartRegex)[1] + '\n';
    };

    var ieConditionalCommentEnd = function(data) {
      return '\n' + data.match(ieConditionalEndRegex)[1] + '-->';
    };

    var ieConditionalCommentContents = function(data) {
      return data.replace(ieConditionalStartRegex, '').replace(ieConditionalEndRegex, '');
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
      return (name === "script") || (name === "link" && attribs.rel === 'stylesheet');
    };

    var javascriptOrStylesheetClosingTag = function(name) {
      return name.match(/^(script|link)$/);
    };


    // Parsing helper function that contains most of the logic =================

    // We want to be able to recurse within the parsing in the case of IE
    // conditional comments, with some state shared between the parent and
    // child calls and some state reset within a nested call.
    var parseHTMLChunk = function(htmlChunk, copyFiles) {

      var output = '';

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

            if (copyFiles) {
              concatFiles(files, concatFilename, inputDirectory, outputDirectory);
            }

            // If there's an IE conditional comment within this block, end it with
            // the ending we stored earlier and reset this storage to empty string
            output += endConditionalComment;
            endConditionalComment = '';

            files = [];
            exitBlock();

          } else if(wholeIeConditionalComment(data) && withinABlock()) {
            // An IE conditional comment with its contents is wholly contained
            // within a build block (and is the only contents of the build block).

            // Pass the start of the IE conditional comment through
            output += ieConditionalCommentStart(data);

            // Store the end of the conditional comment for when we get to the end
            // of the build block.
            endConditionalComment = ieConditionalCommentEnd(data);

            // Recursively parse the contents of the conditional comment.
            output += parseHTMLChunk(
              ieConditionalCommentContents(data),
              false // The parent call will copy since we're within a block.
            );

          } else if(wholeIeConditionalComment(data) && !withinABlock() && data.match(/build/)) {

            output += ieConditionalCommentStart(data);

            // Store the end of the conditional comment for when we get to the end
            // of the build block.
            endConditionalComment = ieConditionalCommentEnd(data);

            // Recursively parse the contents of the conditional comment.
            output += parseHTMLChunk(
              ieConditionalCommentContents(data).replace(/[^!]--/, ' -->').trim(),
              copyFiles // New build blocks should do what the parent call does
            );

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
              if(copyFiles) {
                transferFileAsIs(attribs, inputDirectory, outputDirectory);                   }
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
      parser.write(htmlChunk);
      parser.end();

      return output;
    };

    // Actually starting the processing ========================================
    return parseHTMLChunk(inputHTML, copyFiles);
  };

  return exports;
};
