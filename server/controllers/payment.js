var _ =           require('underscore');
var PaymentProvider = require('../models/Payment.js').PaymentProvider;
var paymentProvider = new PaymentProvider('localhost', 27017);


module.exports = {
    findAll: function(req, res) {

	   paymentProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  paymentProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });

    },

    findById: function(req, res) {
			paymentProvider.findById(req.params.id, function(error, apartment) {
			res.send(apartment);
		});
    },
    delete: function(req, res) {
		    paymentProvider.delete(req.params.id, function(error, article) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
			var payment = req.body;
			paymentProvider.add(payment, function(error, payment) {
			  if (error) {
				res.send(error, 404);
			  } else {

			  /*
			  email.sendPaymentConfirmation(payment, function(e, m){
					if (!e) {
						//	res.send('ok', 200);
					}	else{
							res.send('email-server-error', 400);
							for (k in e) console.log('error : ', k, e[k]);
					}
			   });
			   */
			   res.send(payment);
			  }
			});
    }

};

