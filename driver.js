var Connection = require('./connection');

var PostgresDriver = module.exports = function(opts) {
  this.opts = opts;
};

PostgresDriver.prototype.init = function(cb) {
  var connection = Connection.create(this.opts);
  connection.init(cb);
};

PostgresDriver.create = function(opts, cb) {
  var driver = new PostgresDriver(opts);
  return driver;
};
