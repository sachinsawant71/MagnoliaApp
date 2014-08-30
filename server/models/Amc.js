var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

AmcProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.user, config.pass, function(error, result) {});
  });
};


AmcProvider.prototype.getCollection= function(callback) {
  this.db.collection('amcData', function(error, amc_collection) {
    if( error ) callback(error);
    else callback(null, amc_collection);
  });
};

AmcProvider.prototype.count = function(callback) {
    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error)
      else {
        amc_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

AmcProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error)
      else {
        amc_collection.findOne({"_id": amc_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


AmcProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['date','desc']]};
	}

    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error)
      else {
        amc_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

AmcProvider.prototype.add = function(vendor, callback) {
    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error)
      else {
        amc_collection.insert(vendor, function() {
					callback(null, vendor);
		});
      }
    });
};

AmcProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error)
      else {
		amc_collection.remove({"_id": amc_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


// update an Vendor
AmcProvider.prototype.update = function(vendor, callback) {
    this.getCollection(function(error, amc_collection) {
      if( error ) callback(error);
      else {
			   amc_collection.update( {_id: new BSON.ObjectID(vendor._id)},
							{$set: {
									vendorName : vendor.vendorName,
									area : vendor.area,
									contactNumber: vendor.contactNumber,
									tin: vendor.tin,
									pan: vendor.pan,
									address: vendor.address,
									active:vendor.active,
						            referencedByName :vendor.referencedbyName,
						            referencedbyContatNumber :vendor.referencedbyContatNumber,
									contacts: vendor.contacts
								}
							},
						function(error, result) {
								if(error) {
									console.log(error);
								}
								else {
									console.log('done');
									callback(null, result);       
								}
				});
      }
    });

};


exports.AmcProvider = AmcProvider;