var pg = require('pg');
var types = pg.types;
var Session = require('./session');

types.setTypeParser(20, function(val) {
  return val === null ? null : parseInt(val);
});

var PostgresConnection = module.exports = function(opts) {
  this.uri = opts.uri;
  this.db = null;
  this.cache = {};
};



PostgresConnection.prototype.init = function(cb) {
  var self = this;
  var client = new pg.Client(this.uri);
  client.connect(function(err) {
    if (err) {
      cb(err);
    }

    self.db = client;
    cb(null, self);
  });
};

PostgresConnection.prototype.createSession = function() {
  return Session.create({db: this.db, cache: this.cache});
};

PostgresConnection.prototype.close = function(cb) {
  if(self.db) {
    self.db.end();
    self.db = null;
  }

  cb(null, true);
};

PostgresConnection.create = function(opts) {
  var connection = new PostgresConnection(opts);
  return connection;
};
