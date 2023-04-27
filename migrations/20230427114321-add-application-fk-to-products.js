
'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.addColumn('products', 'application_id',{
      'type':'int',
      'unsigned': true,
      'notNull':true,
      'defaultValue': 1,
      'foreignKey': {
        'name':'product_application_fk',
        'table':'applications',
        'mapping':'id',
        'rules':{
          'onDelete': 'cascade',
          'onUpdate': 'restrict'
        }
      }    
  });
};


exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
