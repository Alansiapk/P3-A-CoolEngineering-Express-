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
  return db.runSql("INSERT INTO tags (name) VALUES ('R32 gas'),('Smart WIFI Control'),('PM2.5 filters'), ('Auto 3D airflow'), ('NEA 5-ticks'), ('Low Noise 19dB')");
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
