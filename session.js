var Compiler = require('./compiler');

function convertToModel(config, entity, isBare) {
  var obj;
  if (isBare) {
    obj = entity;
  } else {
    obj = Object.create(config.constructor.prototype);
    var keys = Object.keys(config.fieldMap || {});
    keys.forEach(function(key) {
    });
  }

  return obj;
}

var PostgresSession = module.exports = function(opts) {
  this.db = opts.db;
  this.cache = opts.cache || {};
};

PostgresSession.prototype.find = function(query, cb) {
  if (query) {
    var compiler = new Compiler(this.cache);
    var compiled = compiler.compile({ query: query });

    this.db.query(compiled.statement, function(err, result) {

    });
  }
};


PostgresSession.prototype.get = function(query, id, cb) {
  var config = query.modelConfig;
  this.db.query(query, function(err, result) {
    if(err) {
      cb(err);
    }

    cb(result.rows[0]);
  });
};

PostgresSession.create = function(opts) {
  return new PostgresSession(opts);
};
