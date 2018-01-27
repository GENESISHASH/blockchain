// Generated by IcedCoffeeScript 108.0.11
(function() {
  var Block, Schema, b, b2, hash, mongoose, _;

  _ = require('wegweg')({
    globals: true
  });

  mongoose = require('mongoose');

  hash = require('./hash');

  Schema = new mongoose.Schema({
    index: Number,
    ctime: Number,
    hash: String,
    prev_hash: String,
    data: {
      type: mongoose.Schema.Types.Mixed,
      "default": null
    }
  }, {
    _id: false
  });

  Schema.path('index').set(function(x) {
    var _ref, _ref1;
    if (this.hash == null) {
      this.hash = hash.sha256([this.index, this.ctime, (_ref = this.prev_hash) != null ? _ref : null, JSON.stringify((_ref1 = this.data) != null ? _ref1 : {})].join(''));
    }
    return x;
  });

  Schema.methods.is_valid_structure = (function() {
    var k, props, v;
    props = {
      index: 'number',
      ctime: 'number',
      hash: 'string',
      prev_hash: 'string',
      data: 'object'
    };
    for (k in props) {
      v = props[k];
      if (this[k] == null) {
        return false;
      }
      if (v) {
        if (typeof this[k] !== v) {
          return false;
        }
      }
    }
    return true;
  });

  Schema.statics.is_valid_structure = (function(block_obj) {
    var k, props, v;
    props = {
      index: 'number',
      ctime: 'number',
      hash: 'string',
      prev_hash: 'string',
      data: 'object'
    };
    if (block_obj.index === 0) {
      delete props.prev_hash;
    }
    for (k in props) {
      v = props[k];
      if (block_obj[k] == null) {
        return false;
      }
      if (v) {
        if (typeof block_obj[k] !== v) {
          return false;
        }
      }
    }
    return true;
  });

  Schema.statics.calculate_hash = (function(block_obj) {
    var _ref;
    return hash.sha256([block_obj.index, block_obj.ctime, block_obj.prev_hash, JSON.stringify((_ref = block_obj.data) != null ? _ref : {})].join(''));
  });

  module.exports = Block = mongoose.model('Block', Schema);

  if (!module.parent) {
    log(/TEST/);
    b = new Block({
      index: 3,
      ctime: 1517012327,
      hash: hash.sha256('helo'),
      prev_hash: 'abc',
      data: []
    });
    log(/valid block/, b);
    log(/is_valid_structure/, b.is_valid_structure());
    b2 = new Block({
      index: 'a'
    });
    log(/invalid block/, b2);
    log(/is_valid_structure/, b.is_valid_structure());
    exit(0);
  }

}).call(this);
