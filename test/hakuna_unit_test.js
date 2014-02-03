'use strict';
var hakuna = require('../tasks/lib/hakuna.js').init({});

exports.hakuna = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
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
};
