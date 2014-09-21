var caql = require('caql');

function convertOperator(op) {
  var ops = {
    'eq': '=',
    'gte': '>=',
    'lte': '<=',
    'gt': '>',
    'lt': '<'
  };

  return ops[op];
};

var PostgresCompiler = module.exports = function(cache) {
  this.fields = [];
  this.sorts = '';
  this.filter = [];
  this.params = {};
  this.modelFieldMap = null;
  this.cache = cache || {};
};

PostgresCompiler.prototype.compile = function(options) {
  this.modelFieldMap = options.query.modelConfig.fieldMap;
  var config = options.query.modelConfig;
  var query = options.query.build();

  if(query.type === 'ast') {
    query.value.accept(this);
  } else if(query.type === 'ql') {
    var ql = query.value.ql;
    var ast;

    if(this.cache.hasOwnProperty(ql)) {
      ast = this.cache[ql];
    } else {
      ast = caql.parse(query.value.ql);
      this.cache[ql] = ast;
    } 

    this.params = query.value.params;
    ast.accept(this);
  } else if (query.type === 'raw') {
    return query.value;
  }
  
  var fieldMap = {};
  var fields = [];
  var hasFields = false;
  var hasFieldMap = false;

  this.fields.forEach(function(field) {
    if(field.name) {
      fields.push(field.name);
      hasFields = true;
      if(field.alias) {
        fieldMap[field.name] = field.alias;
        hasFieldMap = true;
      }
    }
  });

  if (fields.length === 0) {
    fields.push('*');
  }

  var statement = 'SELECT ' + fields.join(', ');

  statement += ' FROM ' + config.collection;

  if(this.filter.length) {
    statement += ' WHERE ' + this.filter.join(' ');
  }

  if(this.sorts) {
    statement += ' ORDERBY ' + this.sorts;
  }

  return {
    ql: statement,
    fields: hasFields ? fields : null,
    fieldMap: hasFieldMap ? fieldMap : null
  };
};

PostgresCompiler.prototype.visit = function(node) {
  this['visit' + node.type](node);
};

PostgresCompiler.prototype.visitSelectStatement = function(statement) {
  statement.fieldListNode.accept(this);

  if(statement.filterNode) {
    statement.filterNode.accept(this);
  }

  if(statement.orderByNode) {
    statement.orderByNode.accept(this);
  }
};

PostgresCompiler.prototype.visitFieldList = function(fieldList) {
  this.fields = fieldList.fields;
};

PostgresCompiler.prototype.visitFilter = function(filterList) {
  filterList.expression.accept(this);
};

PostgresCompiler.prototype.visitContainsPredicate = function(contains) {
  console.log(contains);
};
PostgresCompiler.prototype.visitLikePredicate = function(like) {
  console.log(like);
};
PostgresCompiler.prototype.visitConjunction = function(conjunction) {
  //console.log(conjunction);
  if(conjunction.isNegated) {
    this.filter.push(' NOT ');
  }

  conjunction.left.accept(this);
  this.filter.push(' AND ');
  conjunction.right.accept(this);
};

PostgresCompiler.prototype.visitComparisonPredicate = function(comparison) {
  if(!comparison.array) comparison.array = [];

  if(this.modelFieldMap[comparison.field]) {
    comparison.field = this.modelFieldMap[comparison.field];
  }

  var isParam = false;
  if (typeof comparison.value === 'string' && comparison.value[0] === '@' && this.params) {
    comparison.value = this.params[comparison.value.substringp(1)];
    isParam = true;
  }


  if (typeof comparison.value === 'string') {
    comparison.value = normalizeString(comparison.value, isParam);
  }

  var expr = [ comparison.field, convertOperator(comparison.operator), comparison.value ];
  if (comparison.isNegated) {
    expr.unshift('not');
  }

  comparison.array.push(expr.join(' '));
  this.filter.push(expr.join(' '));
};


var normalizeString = function(str, isParam) {
  if (str[0] === '\'' && str[str.length - 1] === '\'') {
    return str;
  }

  if (str[0] === '\"' && str[str.length - 1] === '\"') {
    str = str.replace('\"', '\'');
    str = str.replace('\"', '\'');
    return str;
  }

  if (isParam && str[0] === '"' && str[str.length - 1] === '"') {
    str = str.substring(1, str.length - 1);
  }

  str = JSON.stringify(str);
  str = str.substring(1, str.length - 1);
  str = str.replace("'", "\\'");
  str = str.replace('\\"', '"');

  str = "'" + str + "'";
  return str;
};


