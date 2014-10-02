var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

FinAssetsProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


FinAssetsProvider.prototype.getCollection= function(callback) {
  this.db.collection('financialAssetsData', function(error, finassets_collection) {
    if( error ) callback(error);
    else callback(null, finassets_collection);
  });
};

FinAssetsProvider.prototype.count = function(callback) {
    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error)
      else {
        finassets_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

FinAssetsProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error)
      else {
        finassets_collection.findOne({"_id": finassets_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


FinAssetsProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['maturityDate',1]]};
	}

    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error)
      else {
        finassets_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

FinAssetsProvider.prototype.add = function(finasset, callback) {
    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error)
      else {
        finassets_collection.insert(finasset, function() {
					callback(null, finasset);
		});
      }
    });
};

FinAssetsProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error)
      else {
		finassets_collection.remove({"_id": finassets_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


FinAssetsProvider.prototype.update = function(finasset, callback) {
    this.getCollection(function(error, finassets_collection) {
      if( error ) callback(error);
      else {
			   finassets_collection.update( {_id: new BSON.ObjectID(finasset._id)},
							{$set: {
									certificateNo : finasset.certificateNo,
									date : finasset.date,
									maturityDate : finasset.maturityDate,
									period : finasset.period,
									rateOfInterest: finasset.rateOfInterest,
									principalAmt: finasset.principalAmt,
									maturityAmount :finasset.maturityAmount,
						            bankName :finasset.bankName,
						            remarks :finasset.remarks									
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


exports.FinAssetsProvider = FinAssetsProvider;