var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Puid = require('puid');

puid = new Puid(true);

ReceiptsProvider = function(host, port) {
  this.db= new Db('magnolia', new Server(host, port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(){});
};


ReceiptsProvider.prototype.getCollection= function(callback) {
  this.db.collection('receiptsData', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

ReceiptsProvider.prototype.count = function(callback) {

    this.getCollection(function(error, receipt_collection) {
      if( error ) callback(error)
      else {
        receipt_collection.count(function(error, count) {
          if( error ) callback(error)
          else callback(null, count)
        });
      }
    });
};

ReceiptsProvider.prototype.findAll = function(offset,limit,callback) {

    var options = {};
	if (offset && limit) {
		options = {skip:offset, limit:limit,"sort": [['date','desc']]};
	}

    this.getCollection(function(error, receipt_collection) {
      if( error ) callback(error)
      else {
        receipt_collection.find({},options).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

ReceiptsProvider.prototype.add = function(receipt, callback) {
    this.getCollection(function(error, receipt_collection) {
      if( error ) callback(error)
      else {
		receipt.confirmationCode = puid.generate();
        receipt_collection.insert(receipt, function(err,rec) {
					callback(null, receipt);
		});

      }
    });
};

ReceiptsProvider.prototype.delete = function(id, callback) {	
    this.getCollection(function(error, receipt_collection) {
      if( error ) callback(error)
      else {
        receipt_collection.remove({"_id": receipt_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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


// update Receipt
ReceiptsProvider.prototype.update = function(receipt, callback) {
    this.getCollection(function(error, receipt_collection) {
      if( error ) callback(error);
      else {
			   receipt_collection.update( {_id: receipt_collection.db.bson_serializer.ObjectID.createFromHexString(receipt._id) },
							{$set: {
									status: receipt.status
									
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


exports.ReceiptsProvider = ReceiptsProvider;