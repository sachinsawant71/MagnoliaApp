var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var config = require('../config.js');

ApartmentProvider = function(host, port) {
  this.db = new Db(config.db_name, new Server(config.db_host,config.db_port, {auto_reconnect: true}, {}),{safe:false});
  this.db.open(function(error, db){
	db.authenticate(config.db_user, config.db_password, function(error, result) {});
  });
};


ApartmentProvider.prototype.getCollection= function(callback) {
  this.db.collection('apartmentData', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

ApartmentProvider.prototype.findAll = function(callback) {
	
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


ApartmentProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({"flatnumber":id}, function(error, result) {
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

// update an Apartment
ApartmentProvider.prototype.update = function(apartment, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error);
      else {
					article_collection.update( {flatnumber:apartment.flatnumber},
											{$set: {
													gasKYC:apartment.gasKYC,
													status:apartment.status,
													propertyTax:apartment.propertyTax,
													documents: apartment.documents,
													owner: { name: apartment.owner.name,
                                                             coOwnerName: apartment.owner.coOwnerName,
															 address: apartment.owner.address,
															 emails: [apartment.owner.emails[0],apartment.owner.emails[1]],
															 phones: [apartment.owner.phones[0],apartment.owner.phones[1]],
														     vehicles : apartment.owner.vehicles
													},
													tenant: {}
												}
											},
                                        function(error, result) {
                                                if(error) {
													console.log(error);
												}
                                                else {
													console.log("Record updated");
													callback(null, result);       
												}
                                        });
					//update tenant data 
					if (apartment.status=="2"){		
								article_collection.update( {flatnumber:apartment.flatnumber},
											{$set: {
													tenant: { name: apartment.tenant.name,
															  address: apartment.tenant.address,
															  policeverification: apartment.tenant.policeverification,
															  agreement : apartment.tenant.agreement,
															  registration : apartment.tenant.registration,
															  emails: [apartment.tenant.emails[0]],
															  phones: [apartment.tenant.phones[0],apartment.tenant.phones[1]]
													}												
												}
											},
                                        function(error, result) {
                                                if(error) {
													console.log(error);
												}
                                                else {
													console.log("Record updated");
													callback(null, result);       
												}
                                        });
					}


      }
    });

};


// add maintenance period
ApartmentProvider.prototype.addMaintenancePeriod = function(apartment, callback) {
    this.getCollection(function(error, apartment_collection) {
      if( error ) callback(error);
      else {
			apartment_collection.update( {flatnumber:apartment.flatnumber},
						{$set: {
								maintenanceDetails:apartment.maintenanceDetails
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


// update an Apartment
ApartmentProvider.prototype.updatePaymentData = function(apartment, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) {
		  callback(error);
	  }
      else {
				article_collection.update( {flatnumber:apartment.flatnumber},
						{$set: {
								 maintenanceDetails:apartment.maintenanceDetails
							}
						},
					    function(error, result) {
							if(error) {
								console.log(error);
							}
							else {
								console.log("maintenance Details updated for " + apartment.flatnumber);
								callback(null, result);       
							}
				});



      }
    });

};

exports.ApartmentProvider = ApartmentProvider;