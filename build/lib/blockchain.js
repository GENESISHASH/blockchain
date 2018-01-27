// Generated by IcedCoffeeScript 108.0.11
(function() {
  var Block, GENESIS, blockchain, e, hash, iced, next_block, _, __iced_deferrals, __iced_k, __iced_k_noop,
    __slice = [].slice;

  iced = {
    Deferrals: (function() {
      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) {
          return this.continuation(this.ret);
        }
      };

      _Class.prototype.defer = function(defer_params) {
        ++this.count;
        return (function(_this) {
          return function() {
            var inner_params, _ref;
            inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (defer_params != null) {
              if ((_ref = defer_params.assign_fn) != null) {
                _ref.apply(null, inner_params);
              }
            }
            return _this._fulfill();
          };
        })(this);
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    },
    trampoline: function(_fn) {
      return _fn();
    }
  };
  __iced_k = __iced_k_noop = function() {};

  if (!module.parent) {
    global.CONFIG = (require('dotenv').config({
      path: __dirname + '/../../config'
    })).parsed;
  }

  _ = require('wegweg')({
    globals: true
  });

  Block = require('./block');

  hash = require('./hash');

  GENESIS = new Block({
    index: 0,
    ctime: 1517012327,
    hash: hash.sha256(env.GENESIS_HASH_STRING),
    prev_hash: null,
    data: []
  });

  blockchain = {
    blocks: [GENESIS]
  };

  blockchain.get_blockchain = (function(cb) {
    return cb(null, this.blocks);
  });

  blockchain.set_blockchain = (function(chain, cb) {
    this.blocks = chain;
    require('./peers').broadcast_last_block();
    return cb(null, true);
  });

  blockchain.get_block = (function(index_or_hash, cb) {
    var block;
    if (!(block = _.find(this.blocks, {
      index: +index_or_hash
    }))) {
      block = _.find(this.blocks, {
        hash: index_or_hash
      });
    }
    return cb(null, block);
  });

  blockchain.get_last_block = (function(cb) {
    return cb(null, _.last(this.blocks));
  });

  blockchain.add_block = (function(block, cb) {
    var e, valid, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
        });
        _this.is_valid_next_block(block, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              e = arguments[0];
              return valid = arguments[1];
            };
          })(),
          lineno: 51
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (e) {
          return cb(e);
        }
        if (!valid) {
          return cb(new Error('Block is invalid'));
        }
        _this.blocks.push(new Block(block));
        require('./peers').broadcast_last_block();
        return cb(null, true);
      };
    })(this));
  });

  blockchain.replace_chain = (function(new_chain, cb) {
    var e, last_block, valid, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
        });
        _this.get_last_block(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              e = arguments[0];
              return last_block = arguments[1];
            };
          })(),
          lineno: 64
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (e) {
          return cb(e);
        }
        if (last_block.index >= new_chain.length) {
          return cb(null, false);
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
          });
          _this.is_valid_chain(new_chain, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                e = arguments[0];
                return valid = arguments[1];
              };
            })(),
            lineno: 70
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if (e) {
            return cb(e);
          }
          if (!valid) {
            return cb(new Error('Received an invalid chain, refusing to `replace_chain`'));
          }
          log('Replacing our blockchain with a larger chain');
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
            });
            _this.set_blockchain(new_chain, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return e = arguments[0];
                };
              })(),
              lineno: 78
            }));
            __iced_deferrals._fulfill();
          })(function() {
            if (e) {
              return cb(e);
            }
            return cb(null, true);
          });
        });
      };
    })(this));
  });

  blockchain.is_valid_next_block = (function(block, prev_block, cb) {
    var calced_hash, e, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (!Block.is_valid_structure(block)) {
      log(new Error('Invalid block structure'));
      return cb(null, false);
    }
    (function(_this) {
      return (function(__iced_k) {
        if (!prev_block) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
            });
            _this.get_last_block(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  e = arguments[0];
                  return prev_block = arguments[1];
                };
              })(),
              lineno: 91
            }));
            __iced_deferrals._fulfill();
          })(function() {
            if (e) {
              return cb(e);
            }
            return __iced_k();
          });
        } else {
          return __iced_k();
        }
      });
    })(this)((function(_this) {
      return function() {
        if (block.index !== (prev_block.index + 1)) {
          log(new Error('Invalid block index'));
          return cb(null, false);
        }
        if (block.prev_hash !== prev_block.hash) {
          log(new Error('Invalid previous block hash'));
          return cb(null, false);
        }
        if (block.hash !== (calced_hash = Block.calculate_hash(block))) {
          log(new Error('Invalid block hash'));
          return cb(null, false);
        }
        return cb(null, true);
      };
    })(this));
  });

  blockchain.is_valid_chain = (function(chain, cb) {
    var block, chain_genesis, e, i, key, valid, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _len, _ref;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    chain_genesis = chain[0];
    _ref = ['index', 'hash', 'ctime'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (chain_genesis[key] !== GENESIS[key]) {
        log(new Error('Invalid genesis block'));
        return cb(null, false);
      }
    }
    i = 0;
    (function(_this) {
      return (function(__iced_k) {
        var _j, _len1, _ref1, _results, _while;
        _ref1 = chain;
        _len1 = _ref1.length;
        _j = 0;
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = __iced_k;
          _continue = function() {
            return iced.trampoline(function() {
              ++_j;
              return _while(__iced_k);
            });
          };
          _next = _continue;
          if (!(_j < _len1)) {
            return _break();
          } else {
            block = _ref1[_j];
            (function(__iced_k) {
              if (i === 0) {
                i += 1;
                (function(__iced_k) {
_continue()
                })(__iced_k);
              } else {
                return __iced_k();
              }
            })(function() {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
                });
                _this.is_valid_next_block(block, chain[i - 1], __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      e = arguments[0];
                      return valid = arguments[1];
                    };
                  })(),
                  lineno: 128
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (e) {
                  return cb(e);
                }
                if (!valid) {
                  log(new Error('Invalid block in chain', block.index));
                  return cb(null, false);
                } else {
                  i += 1;
                }
                return _next();
              });
            });
          }
        };
        _while(__iced_k);
      });
    })(this)((function(_this) {
      return function() {
        return cb(null, true);
      };
    })(this));
  });

  blockchain.generate_next_block = (function(data, cb) {
    var block, e, last, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
        });
        _this.get_last_block(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              e = arguments[0];
              return last = arguments[1];
            };
          })(),
          lineno: 141
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (e) {
          return cb(e);
        }
        block = new Block({
          index: last.index + 1,
          ctime: _.time(),
          prev_hash: last.hash,
          data: data
        });
        block.hash = Block.calculate_hash(block);
        return cb(null, block);
      };
    })(this));
  });

  module.exports = blockchain;

  if (!module.parent) {
    log(/TEST/);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          filename: "/Users/tky/www/blockchain/src/lib/blockchain.iced"
        });
        blockchain.generate_next_block('Hello', __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              e = arguments[0];
              return next_block = arguments[1];
            };
          })(),
          lineno: 163
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (e) {
          throw e;
        }
        log(/next_block/, next_block);
        return __iced_k(exit(0));
      };
    })(this));
  } else {
    __iced_k();
  }

}).call(this);
