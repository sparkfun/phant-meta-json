/**
 * phant-storage-json
 * https://github.com/sparkfun/phant-storage-json
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
    events = require('events');

/**** PhantStorage prototype ****/
var app = {};

/**** Expose PhantStorage ****/
exports = module.exports = PhantStorage;

/**** Initialize a new PhantStorage ****/
function PhantStorage(config) {

  var storage = {};

  config = config || {};

  _.extend(storage, app);
  _.extend(storage, events.EventEmitter.prototype);
  _.extend(storage, config);

  return storage;

}

app.name = 'phant json storage';
app.directory = path.join('..', '.tmp');

app.getStreams = function(callback) {

  var file = path.join(this.directory, 'streams.json');

  fs.readFile(file, function(err, data) {

    if(err) {
      callback([]);
      return;
    }

    try {
      callback(JSON.parse(data));
      return;
    } catch(err) {
      callback([]);
      return;
    }

  });

};

app.saveStreams = function(streams, callback) {

  var file = path.join(this.directory, 'streams.json');

  try {
    streams = JSON.stringify(streams);
  } catch(err) {
    callback('stream data corruption', false);
  }

  fs.writeFile(file, streams, function(err) {

    if(err) {
      callback(err);
      return;
    }

    callback('');

  });

};


app.list = function(callback) {

  this.getStreams(function(streams) {

    callback('', streams);

  });

};

app.get = function(id, callback) {

  this.getStreams(function(streams) {

    var stream = _.findWhere(streams, { id: id });

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

    var whitelist = ['title', 'description', 'fields', 'tags'],
        diff = _.difference(_.keys(data), whitelist);

    if(diff.length !== 0) {
      callback('saving stream failed', false);
      return;
    }

    data.id = self.newId();
    data.date = Date.now();

    streams.push(data);

    self.saveStreams(streams, function(err) {

      if(err) {
        callback(err, false);
        return;
      }

      callback('', data);

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

app.validateFields = function(id, data, callback) {

  this.getStreams(function(streams) {

    var stream = _.findWhere(streams, { id: id }),
        err = '';

    if(! stream) {
      callback('stream not found', false);
      return;
    }

    // make sure all keys are valid
    for(var key in data) {

      if(! data.hasOwnProperty(key)) {
        continue;
      }

      if(stream.fields.indexOf(key) === -1) {

        err = key + " is not a valid field for this stream. \n\n";
        err += 'expecting: ' + stream.fields.join(', ');

        return callback(err, false);

      }

    }

    // make sure all fields exist in data
    for(var i=0; i < stream.fields.length; i++) {

      if(! data.hasOwnProperty(stream.fields[i])) {

        err = stream.fields[i] + " missing from sent data. \n\n";
        err += 'expecting: ' + stream.fields.join(', ');

        return callback(err, false);

      }

    }

    callback('', true);

  });

};

