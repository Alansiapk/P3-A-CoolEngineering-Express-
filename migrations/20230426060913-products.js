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
  return db.createTable('products',{
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    name: {
      type: 'string',
      length: 100,
      notNull: true
    },
    cost:{
      type:'int',
      "unsigned": true,
      "notNull":true
  },
    description:{
      type: 'text'
    },
    warranty: {
      type: 'string',
      length: 100,
      notNull: true
    },
    indoor_unit: {
      type: 'string',
      length: 200,
      notNull: true
    },
    outdoor_unit:{
      type: 'string',
      length: 100,
      notNull: true
    },
    date_created: {
      type: 'timestamp',
      defaultValue: new String('CURRENT_TIMESTAMP'),
      notNull: true,
    }
  });
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};