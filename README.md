# grunt-block-concat

> Concats files specified in blocks in HTML and replaces the reference to the new file. Uses an HTML parser rather than regex.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-block-concat --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-block-concat');
```

## The "blockConcat" task

`blockConcat` parses your HTML file(s) with an HTML parser and looks for comments that surround a group of JavaScript or CSS references. It will then:

  1. Concat the files referenced in that block
  1. Write the result to the one filename referenced in the block config
  1. Replace the comments and references with one reference to the resulting file

It assumes that your input filepaths are relative to `src` and your output files (both the HTML files with their references replaced and the results of concat) will be relative to `dest` in the task options.

Any references to files that are not within a block will have the referenced files and HTML reference copied as-is to dest.

### Blocks

The block configuration is similar to those in [usemin](https://github.com/yeoman/grunt-usemin#blocks), namely:

```html
<!-- build <path> -->
... HTML Markup, list of script / link tags.
<!-- endbuild -->
```

- **path**: the file path, including filename, of the resulting file (the target output of concat)

An example of this in completed form can be seen below:

```html
<!-- build js/app.js -->
<script src="js/app.js"></script>
<script src="js/controllers/thing-controller.js"></script>
<script src="js/models/thing-model.js"></script>
<script src="js/views/thing-view.js"></script>
<!-- endbuild -->
```

After running the task, this will be modified to be:
```html
<script src="js/app.js"></script>
````

### Overview
In your project's Gruntfile, add a section named `blockConcat` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  blockConcat: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

There are no options at this time.

### Usage Examples

Please see test/fixtures/project1 for an example project, and see test/expected/project1 for the output of running this blockConcat config on that project:

```js
grunt.initConfig({
  blockConcat: {
    default_options: {
      options: {
      },
      files: [{
        expand: true,
        cwd: 'test/fixtures/project1',
        src: '**/*.html',
        dest: 'tmp/default_options'
      }],
    },
  },
});
```

Other examples to come:

* In-place changes (by not specifying a `dest`)
* Different search path (output of another build step)

## Philosophy

* **Do one thing and do it well**. This plugin only handles concatenation references rather than supporting a pipeline of actions to happen between reading the configuration and writing out the files.
* **Trying to parse HTML with regex is brittle and bug-ridden**. [The center cannot hold](http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454).

## Contributing

We :heart: contributions of all kinds, including, but not limited to: documentation, bug reports, bug fixes, failing tests, passing tests, feature suggestions, and new features. We reserve the right to decline to add new functionality in order to keep this project light and reliable. We promise every issue or PR will get emoji. :sparkles:

## Release History
_(Nothing yet)_
