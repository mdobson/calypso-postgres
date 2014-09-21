var Compiler = require('./compiler');

function convertToModel(config, entity, isBare) {
  var obj;
  if (isBare) {
    obj = entity;
  } else {
    obj = Object.create(config.constructor.prototype);
    var keys = Object.keys(config.fieldMap || {});
    keys.forEach(function(key) {
      var prop = config.fieldMap[key] || key;
      obj[key] = prop;
    });
  }

  return obj;
}

var PostgresSession = module.exports = function(opts) {
  this.db = opts.db;
  this.cache = opts.cache || {};
};

PostgresSession.prototype.find = function(query, cb) {
  var entities = [];
  if (query) {
    var config = query.modelConfig;
    var compiler = new Compiler(this.cache);
    var compiled = compiler.compile({ query: query });

    console.log(compiled.ql);
    this.db.query(compiled.ql, function(err, result) {
      if(err) {
        cb(err);
      } else {
        var obj = {};
        result.rows.forEach(function(row) {
          var obj = convertToModel(config, row, config.isBare);
          entities.push(obj);
        });
        cb(err, entities);
      }
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
