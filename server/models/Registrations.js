var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

RegistrationsProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


RegistrationsProvider.prototype.getCollection= function(callback) {
  this.db.collection('registrations', function(error, registrations_collection) {
    if( error ) callback(error);
    else callback(null, registrations_collection);
  });
};

RegistrationsProvider.prototype.count = function(callback) {
    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error)
      else {
        registrations_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

RegistrationsProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error)
      else {
        registrations_collection.findOne({"_id": registrations_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) {
			  console.log(error);
		  }
          else {
			  callback(null, result)
		  }
        });
      }
    });
};


RegistrationsProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {sort: [['createdDate','desc']]};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['createdDate','desc']]};
	}

    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error)
      else {
        registrations_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

RegistrationsProvider.prototype.add = function(registration, callback) {
    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error)
      else {
        registrations_collection.insert(registration, function() {
					callback(null, registration);
		});
      }
    });
};

RegistrationsProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error)
      else {
		registrations_collection.remove({"_id": registrations_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) {
			  console.log(error);
		  }
          else {
			 callback(null,result)
		  }
        });
      }
    });
};


RegistrationsProvider.prototype.update = function(registration, callback) {
    this.getCollection(function(error, registrations_collection) {
      if( error ) callback(error);
      else {
			   registrations_collection.update( {_id: new BSON.ObjectID(registration._id)},
							{$set: {
									status: 1
								}
							},
						function(error, result) {
								if(error) {
									console.log(error);
								}
								else {
									callback(null, result);       
								}
				});
      }
    });

};


exports.RegistrationsProvider = RegistrationsProvider;