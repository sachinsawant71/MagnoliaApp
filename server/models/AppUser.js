var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

AppUsersProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};

AppUsersProvider.prototype.getCollection= function(callback) {
  this.db.collection('users', function(error, user_collection) {
    if( error ) callback(error);
    else callback(null, user_collection);
  });
};

AppUsersProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


AppUsersProvider.prototype.findByEmail = function(email,callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({"username":email}, function(error, result) {
			callback(error,result);
        });
      }
    });
};



AppUsersProvider.prototype.add = function(user, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.insert(user, function() {
					callback(null, user);
		});
      }
    });
};

AppUsersProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
		user_collection.remove({"_id": user_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


// update user
AppUsersProvider.prototype.update = function(user, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error);
      else {
			   user_collection.update( {_id: new BSON.ObjectID(user._id)},
							{$set: {
						            role : user.role
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

// update user
AppUsersProvider.prototype.updateResetPasswordToken = function(user, callback) {
    this.getCollection(function(error, user_collection) {
      if(error) callback(error);
      else {
			   user_collection.update( {_id: user._id},
							{$set: {
								      resetPasswordToken : user.resetPasswordToken,
								      resetPasswordExpires : user.resetPasswordExpires
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


exports.AppUsersProvider = AppUsersProvider;