var pg = require('pg');
var types = pg.types;

var connectionString = 'postgres://mdobs@localhost/mdobs';

types.setTypeParser(20, function(val) {
  return val === null ? null : parseInt(val);
});


pg.connect(connectionString, function(err, client, done) {
  if(err) {
    console.log(err);
  } else {
    client.query('SELECT * FROM foobar', function(err, result) {
      done();

      if(err) {
        console.log(err);
      } else {
        result.rows.forEach(function(row) {
          console.log(row.bar);
        });
      }
    });
  }
});
