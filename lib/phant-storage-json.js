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
app.directory = '';

