// In charge of opening the DB

var mongo = require('mongodb');

var mongoServer = mongo.Server;
var mongoDb = mongo.Db;

// Used in services
GLOBAL.BSON = mongo.BSONPure;

var dbOptions = {
	host: 'localhost',
	port: 27017,
	name: GLOBAL.DATABASE_NAME || 'magnoliadb' // GLOBAL.DATABASE_NAME is set to a different name when tests are run
};

var server = new mongoServer(dbOptions.host, dbOptions.port, {auto_reconnect: true});
GLOBAL.db = new mongoDb(dbOptions.name, server);
 
db.open(function(err, db) {
    if(!err) {
        console.log('Connected to ' + dbOptions.name + ' database');
    }
});