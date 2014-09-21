var calypso = require('calypso');
var Query = calypso.Query;
var PostgresDriver = require('../driver');

var engine = calypso.configure({
  driver: PostgresDriver.create({
    uri: 'postgres://mdobs@localhost/mdobs'
  })
});

engine.build(function(err, connection) {
  var session = connection.createSession();

  var query = Query.of('foobar').ql('select foo where bar > 2 and foo contains "ma"');

  // var query = Query.of('foobar').where({ bar: 2 });
  session.find(query, function(err, objs) {
    console.log(objs);
  });

});
