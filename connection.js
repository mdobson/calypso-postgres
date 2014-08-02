var pg = require('pg');
var Session = require('./session');

var PostgresConnection = module.exports = function(opts) {
  this.uri = opts.uri;
  this.db = null;
  this.cache = {};
};



PostgresConnection.prototype.init = function(cb) {
  var self = this;
  var client = new pg.Client(this.uri);
  client.connect(this.uri, function(err) {
    if (err) {
      cb(err);
    }

    self.db = client;
    cb(null, self.db);
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
