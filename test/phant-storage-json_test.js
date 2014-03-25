'use strict';

var phantStorage = require('../lib/phant-storage-json.js');

exports.phantStorage= {
  setUp: function(done) {
    done();
  },
  'no args': function(test) {
    test.expect(1);
    test.ok(phantStorage, 'should be ok');
    test.done();
  }
};
