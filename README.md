#Calypso driver for Postgres

Hooks for Postgres into calypso.

##Usage

To configure the driver you need to provide the URI to the server.

```javascript
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

  var query = Query.of('foobar');

  session.find(query, function(err, objs) {
    console.log(objs);
  });
});
```
