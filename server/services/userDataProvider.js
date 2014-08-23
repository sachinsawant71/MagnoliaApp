var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

UserDataProvider = function(host, port) {
  this.db= new Db('magnolia', new Server(host, port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(){});
};


UserDataProvider.prototype.getCollection= function(callback) {
  this.db.collection('users', function(error, user_collection) {
    if( error ) callback(error);
    else callback(null, user_collection);
  });
};

UserDataProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
	  console.log("in callback");
      if( error ) callback(error)
      else {
        user_collection.find().toArray(function(error, results) {
		  		  console.log("result " + result);
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


UserDataProvider.prototype.findByEmail = function(email, callback) {
	console.log(email);
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({"email":email}, function(error, result) {
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


UserDataProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        user_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};

exports.UserDataProvider = UserDataProvider;