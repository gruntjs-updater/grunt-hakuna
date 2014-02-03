'use strict';
var hakuna = require('../tasks/lib/hakuna.js').init({});

exports.hakuna = {

  useminApi: function(test) {
    var input = ['<!-- build:js js/app.js -->',
                 '<script src="js/app.js"></script>',
                 '<script src="js/controllers/thing-controller.js"></script>',
                 '<script src="js/models/thing-model.js"></script>',
                 '<script src="js/views/thing-view.js"></script>',
                 '<!-- endbuild -->'].join('\n');
    var output = hakuna.processHTML({
      inputHTML: input,
      copyFiles: false
    });
    test.equal(output, '<script type="text/javascript" src="js/app.js"></script>');
    test.done();
  },

  windowsNewlines: function(test) {
    var input = ['<!-- build styles/homepage.css -->',
                 '<link rel="stylesheet" href="styles/main.css" />',
                 '<link rel="stylesheet" href="styles/blog.css" />',
                 '<!-- /build -->'].join('\r\n');
     var output = hakuna.processHTML({
       inputHTML: input,
       copyFiles: false
     });
     test.equal(output, '<link rel="stylesheet" href="styles/homepage.css"></link>');
     test.done();
  },
};
