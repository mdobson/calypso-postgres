var calypso = require('calypso');
var Query = calypso.Query;
var PostgresDriver = require('../driver');

var Product = function() {
  this.id = null;
  this.name = null;
  this.quantity = null;
  this.price = null;
}

var mapping = function(config) {
  config
    .of(Product)
    .at('products')
    .map('id')
    .map('name')
    .map('quantity')
    .map('price', {to: 'value'});
};

var engine = calypso.configure({
  driver: PostgresDriver.create({
    uri: 'postgres://mdobs@localhost/mdobs'
  }),
  mappings: [mapping]
});

engine.build(function(err, connection) {
  var session = connection.createSession();

  //var query = Query.of('foobar').ql('select foo where foo contains "ma"');

  // var query = Query.of('foobar').where({ bar: 2 });
  /*session.find(query, function(err, objs) {
    console.log(objs);
  });*/

  var query = Query.of(Product)
    .ql('where price>@price')
    .params({ price: 100.00 });

  session.find(query, function(err, products) {
    console.log(products);
  });

  /*session.get(Query.of(Product), 3, function(err, product) {
    console.log(product);
  });*/

});
