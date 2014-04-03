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

  return storage;

}

app.name = 'phant json metadata storage';
app.directory = path.join(__dirname, '..');

app.newId = function() {
  return uuid.v1().replace(/-/g, '');
};

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


app.list = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  this.getStreams(function(streams) {

    callback('', streams.slice(offset, limit + offset));

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

