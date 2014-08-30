var mongo = require('mongodb');
var Db = mongo.Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var BSON = mongo.BSONPure;
var config = require('../config.js');

VendorsProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


VendorsProvider.prototype.getCollection= function(callback) {
  this.db.collection('vendorsData', function(error, vendor_collection) {
    if( error ) callback(error);
    else callback(null, vendor_collection);
  });
};

VendorsProvider.prototype.count = function(callback) {
    this.getCollection(function(error, vendor_collection) {
      if( error ) callback(error)
      else {
        vendor_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};


VendorsProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['date','desc']]};
	}

    this.getCollection(function(error, vendor_collection) {
      if( error ) callback(error)
      else {
        vendor_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

VendorsProvider.prototype.add = function(vendor, callback) {
    this.getCollection(function(error, vendor_collection) {
      if( error ) callback(error)
      else {
        vendor_collection.insert(vendor, function() {
					callback(null, vendor);
		});
      }
    });
};

VendorsProvider.prototype.delete = function(id, callback) {
    this.getCollection(function(error, vendor_collection) {
      if( error ) callback(error)
      else {
		vendor_collection.remove({"_id": vendor_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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
VendorsProvider.prototype.update = function(vendor, callback) {
    this.getCollection(function(error, vendor_collection) {
      if( error ) callback(error);
      else {
		       console.log('in update');
			   console.log(JSON.stringify(vendor));
			   vendor_collection.update( {_id: new BSON.ObjectID(vendor._id)},
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


exports.VendorsProvider = VendorsProvider;