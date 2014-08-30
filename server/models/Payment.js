var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var config = require('../config.js');

PaymentProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(){});
};


PaymentProvider.prototype.getCollection= function(callback) {
  this.db.collection('paymentData', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};


PaymentProvider.prototype.count = function(callback) {
    this.getCollection(function(error, payment_collection) {
      if( error ) callback(error)
      else {
        payment_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};


PaymentProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['date','desc']]};
	}

    this.getCollection(function(error, payment_collection) {
      if( error ) callback(error)
      else {
        payment_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

PaymentProvider.prototype.add = function(payment, callback) {
    this.getCollection(function(error, payment_collection) {
      if( error ) callback(error)
      else {
        payment_collection.insert(payment, function() {
          callback(null, payment);        });

      }
    });
};

PaymentProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, payment_collection) {
      if( error ) callback(error)
      else {
        payment_collection.remove({"_id": payment_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


exports.PaymentProvider = PaymentProvider;