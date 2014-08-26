var _ =           require('underscore');
var VendorsProvider = require('../models/Vendors.js').VendorsProvider;
var vendorsProvider = new VendorsProvider('localhost', 27017);


module.exports = {
    findAll: function(req, res) {

	   vendorsProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  vendorsProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });


    },

    findById: function(req, res) {
			vendorsProvider.findById(req.params.id, function(error, vendor) {
			res.send(apartment);
		});
    },
    delete: function(req, res) {
		    vendorsProvider.delete(req.params.id, function(error, vendor) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
			var vendor = req.body;
			vendorsProvider.add(vendor, function(error, vendor) {
			  if (error) {
				res.send(error, 500);
			  } else {

			  /*
			  email.sendReceiptConfirmation(vendor, function(e, m){
					if (!e) {
						//	res.send('ok', 200);
					}	else{
							res.send('email-server-error', 400);
							for (k in e) console.log('error : ', k, e[k]);
					}
			   });
			   */
			   res.send(vendor);
			  }
			});
    },
    update: function(req, res) {
			var vendor = req.body;
			vendorsProvider.update(vendor, function(error, updatedVendor) {			  
			  if (error) {
				res.send(error, 500);
			  } else {
				console.log('updated vendor');
				console.log(updatedVendor);
				res.send(updatedVendor,200);
			  }
			}); 
    }

};

