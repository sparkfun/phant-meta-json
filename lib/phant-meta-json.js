/**
 * phant-meta-json
 * https://github.com/sparkfun/phant-meta-json
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var _ = require('lodash'),
    path = require('path'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    events = require('events');

/**** PhantMeta prototype ****/
var app = {};

/**** Expose PhantMeta ****/
exports = module.exports = PhantMeta;

/**** Initialize a new PhantMeta ****/
function PhantMeta(config) {

  var storage = {};

  config = config || {};

  _.extend(storage, app);
  _.extend(storage, events.EventEmitter.prototype);
  _.extend(storage, config);

  fs.exists(storage.directory, function(exists) {

    if(exists) {
      return;
    }

    mkdirp(storage.directory);

  });

  return storage;

}

app.name = 'Metadata JSON';
app.directory = path.join(__dirname, '..');

function newId() {
  return uuid.v1().replace(/-/g, '');
}

function reverseSort(field) {

  return function(a, b) {

    if(a[field] === b[field]) {
      return 0;
    }

    if(! a[field]) {
      return -1;
    }

    if(! b[field]) {
      return 1;
    }

    return b[field] - a[field];

  };

}

app.getStreams = function(callback) {

  var file = path.join(this.directory, 'streams.json');

  fs.readFile(file, function(err, data) {

    if(err) {
      callback([]);
      return;
    }

    try {
      data = JSON.parse(data);
    } catch(err) {
      return callback([]);
    }

    return callback(data);

  });

};

app.saveStreams = function(streams, callback) {

  var file = path.join(this.directory, 'streams.json');

  try {
    streams = JSON.stringify(streams);
  } catch(err) {
    callback('stream data corruption');
  }

  fs.writeFile(file, streams, function(err) {

    if(err) {
      callback(err);
      return;
    }

    return callback('');

  });

};

app.all = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  this.getStreams(function(streams) {

    var result = streams.sort(reverseSort('date'));

    callback('', result.slice(offset, limit + offset));

  });

};

app.list = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  this.getStreams(function(streams) {

    var result = _.filter(streams, function(stream) {

      return !stream.hidden && !stream.flagged;

    }).sort(reverseSort('date'));

    callback('', result.slice(offset, limit + offset));

  });

};

app.listByTag = function(tag, callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  this.getStreams(function(streams) {

    var result = _.filter(streams, function(stream) {

      return !stream.hidden && !stream.flagged && _.contains(stream.tags, tag);

    }).sort(reverseSort('date'));

    callback('', result.slice(offset, limit + offset));

  });

};

app.listByActivity = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  this.getStreams(function(streams) {

    var result = _.filter(streams, function(stream) {

      return !stream.hidden && !stream.flagged;

    }).sort(reverseSort('last_push'));

    callback('', result.slice(offset, limit + offset));

  });

};

app.get = function(id, callback) {

  this.getStreams(function(streams) {

    var stream = _.find(streams, { id: id });

    if(! stream) {
      callback('stream not found', false);
      return;
    }

    callback('', stream);

  });

};

app.create = function(data, callback) {

  var self = this;

  this.getStreams(function(streams) {

    var whitelist = ['title', 'description', 'fields', 'tags', 'hidden'],
        diff = _.difference(_.keys(data), whitelist);

    if(diff.length !== 0) {
      callback('saving stream failed', false);
      return;
    }

    data.id = newId();
    data.date = Date.now();
    data.last_push = 0;
    data.flagged = false;

    streams.push(data);

    self.saveStreams(streams, function(err) {

      if(err) {
        return callback(err, false);
      }

      callback('', data);

    });

  });

};

app.touch = function(id, callback) {

  var self = this;

  this.getStreams(function(streams) {

    var stream = _.find(streams, { id: id });

    if(! stream) {
      return callback('stream not found', false);
    }

    stream.last_push = Date.now();

    self.saveStreams(streams, function(err) {

      if(err) {
        return callback(err, false);
      }

      callback('', true);

    });

  });

};

app.flag = function(id, callback) {

  var self = this;

  this.getStreams(function(streams) {

    var stream = _.find(streams, { id: id });

    if(! stream) {
      return callback('stream not found', false);
    }

    stream.flagged = true;

    self.saveStreams(streams, function(err) {

      if(err) {
        return callback(err, false);
      }

      callback('', true);

    });

  });

};



app.remove = function(id, callback) {

  var self = this;

  this.getStreams(function(streams) {

    streams = _.reject(streams, { id: id });

    self.saveStreams(streams, function(err) {

      if(err) {
        callback(err, false);
        return;
      }

      callback('', true);

    });

  });

};

