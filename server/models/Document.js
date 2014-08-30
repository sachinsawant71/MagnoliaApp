var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var config = require('../config.js');

DocumentProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


DocumentProvider.prototype.getCollection= function(callback) {
  this.db.collection('documents', function(error, document_collection) {
    if( error ) callback(error);
    else callback(null, document_collection);
  });
};


DocumentProvider.prototype.count = function(callback) {
    this.getCollection(function(error, document_collection) {
      if( error ) callback(error)
      else {
        document_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

DocumentProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['date','desc']]};
	}

    this.getCollection(function(error, document_collection) {
      if( error ) callback(error)
      else {
        document_collection.find({"flatnumber":"*"},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


DocumentProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, document_collection) {
      if( error ) callback(error)
      else {
        document_collection.findOne({"_id": document_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


DocumentProvider.prototype.add = function(doc, callback) {
    this.getCollection(function(error, document_collection) {
      if(error) callback(error)
      else {
        document_collection.insert(doc, function() {
		  console.log('document added');
          callback(error,doc);        
		});
      }
    });
};


DocumentProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, document_collection) {
      if( error ) callback(error)
      else {
        document_collection.remove({"_id":  ObjectID.createFromHexString(id)}, function(error, result) {
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

exports.DocumentProvider = DocumentProvider;