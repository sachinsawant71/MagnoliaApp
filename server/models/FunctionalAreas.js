var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

FunctionalAreaProvider = function(host, port) {
  this.db= new Db('magnolia', new Server(host, port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(){});
};


FunctionalAreaProvider.prototype.getCollection= function(callback) {
  this.db.collection('functionalareas', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};


FunctionalAreaProvider.prototype.count = function(callback) {
    this.getCollection(function(error, functionaArea_collection) {
      if( error ) callback(error)
      else {
        functionaArea_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};


FunctionalAreaProvider.prototype.findAll = function(callback) {

    this.getCollection(function(error, functionaArea_collection) {
      if( error ) callback(error)
      else {
        functionaArea_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

FunctionalAreaProvider.prototype.add = function(functionaArea, callback) {
    this.getCollection(function(error, functionaArea_collection) {
      if( error ) callback(error)
      else {
        functionaArea_collection.insert(functionaArea, function() {
          callback(null, functionaArea);        });

      }
    });
};

FunctionalAreaProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, functionaArea_collection) {
      if( error ) callback(error)
      else {
        functionaArea_collection.remove({"_id": functionaArea_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


exports.FunctionalAreaProvider = FunctionalAreaProvider;