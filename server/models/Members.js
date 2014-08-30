var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

MembersProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(){});
};


MembersProvider.prototype.getCollection= function(callback) {
  this.db.collection('membersData', function(error, member_collection) {
    if( error ) callback(error);
    else callback(null, member_collection);
  });
};

MembersProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, member_collection) {
      if( error ) callback(error)
      else {
        member_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

MembersProvider.prototype.add = function(member, callback) {
    this.getCollection(function(error, member_collection) {
      if( error ) callback(error)
      else {
        member_collection.insert(member, function() {
					callback(null, member);
		});
      }
    });
};

MembersProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, member_collection) {
      if( error ) callback(error)
      else {
		member_collection.remove({"_id": member_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


// update member
MembersProvider.prototype.update = function(member, callback) {
    this.getCollection(function(error, member_collection) {
      if( error ) callback(error);
      else {
			   member_collection.update( {_id: new BSON.ObjectID(member._id)},
							{$set: {
						            functionAreas : member.functionAreas,
						            active: member.isActive
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


exports.MembersProvider = MembersProvider;