/**
 * phant-storage-json
 * https://github.com/sparkfun/phant-storage-json
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var _ = require('underscore'),
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

  fs.readFile(file, 'utf8', function(err, data) {

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

app.list = function(callback) {

  this.getStreams(function(streams) {

    callback('', this.streams);

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
