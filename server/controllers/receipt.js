var _ =           require('underscore');
var moment = require('moment');
var fs = require('fs');
var PDFDocument = require('pdfkit');
var MemoryStream = require('memorystream');

var emailSender = require('../services/email-dispatcher.js');
var ReceiptsProvider = require('../models/Receipts.js').ReceiptsProvider;
var ApartmentProvider = require('../models/Apartment.js').ApartmentProvider;

var receiptsProvider = new ReceiptsProvider();
var apartmentProvider = new ApartmentProvider();



module.exports = {
    findAll: function(req, res) {
	
	   receiptsProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  receiptsProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });
    },

    findById: function(req, res) {
			receiptsProvider.findById(req.params.id, function(error, apartment) {
			res.send(apartment);
		});
    },
    delete: function(req, res) {
		    receiptsProvider.delete(req.params.id, function(error, article) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
			var receipt = req.body;
			receiptsProvider.add(receipt, function(error, receipt) {
			  if (error) {
				res.send(error, 404);
			  } else {

				  Number.prototype.format = function(n, x) {
					    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
						return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
				  };
				  var receiptAmt = parseInt(receipt.amount);
				  if (receipt.flatnumber) {
						if (receipt.type === 'Maintenance Payment') {
							var letterObject = {
								flatnumber : receipt.flatnumber,
								period : receipt.period,
								memberName : receipt.partyName,
								mode : receipt.mode,
								amount : receiptAmt.format(2),
								confirmationCode : receipt.confirmationCode,
								receiptDate: moment(receipt.date).format('LL')
						   }
						   var subjectLine = "Payment Confirmation for " + receipt.flatnumber + "@magnolia - " + receipt.period;							
						   emailSender.sendMail('maintenancePaymentConfirmation.html',subjectLine,letterObject,receipt.email);
						}
						if (receipt.type === 'Clubhouse Rental') {
							var letterObject = {
								flatnumber : receipt.flatnumber,
								period : receipt.period,
								memberName : receipt.partyName,
								mode : receipt.mode,
								amount : receiptAmt.format(2),
								eventDate: moment(receipt.eventDate).format('LL'),
								confirmationCode : receipt.confirmationCode,
								receiptDate: moment(receipt.date).format('LL')
						   }
						   var subjectLine = "Payment Confirmation for " + receipt.flatnumber + "@magnolia - " + receipt.period;							
						   emailSender.sendMail('maintenancePaymentConfirmation.html',subjectLine,letterObject,receipt.email);
						}
				  }

                  res.send(receipt);
			  }
			});
    },
    update: function(req, res) {

			var receipt = req.body;
			receiptsProvider.update(receipt, function(error, updatedReceipt) {
			  if (error) {
				res.send(error, 500);
			  } else {
				  if (receipt.status == 1)  {
					  apartmentProvider.findById(receipt.flatnumber, function(error, apartment) {
						  if (apartment) {
							  	var periodData = apartment.maintenanceDetails.paymentSummary;
								for (var i = periodData.length - 1; i > -1  ; i--)	{
									var periodDetails = periodData[i];
									if (periodDetails.period == receipt.period){
										periodDetails.maintenancePaid = periodDetails.maintenancePaid + receipt.amount;
										apartment.maintenanceDetails.maintenancePaidTotal = apartment.maintenanceDetails.maintenancePaidTotal + receipt.amount;
										break;
									}									
								}				
								apartmentProvider.updatePaymentData(apartment, function(error, apartment) {
								  if (error) {
									console.log('Error while updaing payment record for apartment ');
								  } else {
									console.log('payment recorded');
								  }
								}); 							
						  }					
					  });
				  }
				  res.send(updatedReceipt);
			  }
			}); 
    },
    getConfirmation: function(req, res) {

			doc = new PDFDocument();

			doc.pipe(new MemoryStream());
			//doc.pipe(fs.createWriteStream(res));

			//doc.image('printlogo.png', 200, 15,{scale: 0.45});


			doc.fontSize(12);

			doc.lineWidth(0.75);
			doc.moveTo(50,75).lineTo(550, 75);
			doc.stroke();

			doc.text('P A Y M E N T   R E C E I P T', 225, 82)

			doc.moveTo(50,99).lineTo(550, 99);
			doc.stroke();

			doc.fontSize(10)
			   .text('Date: 15/8/2014', 50, 110)


			doc.text('Apartment Number:', 150, 150)
			doc.text('D-105', 300, 150)

			doc.text('Owner\'s Name:', 150, 170)
			doc.text('Sachin Anand Sawant', 300, 170)

			doc.text('Payment Details:', 150, 190)
			doc.text('Clubhouse Rental for event on 05-08-2014', 300, 190)

			doc.text('Amount:', 150, 210)
			doc.text('$2,333.00', 300, 210)

			doc.text('Mode of Payment:', 150, 230)
			doc.text('Check', 300, 230)

			doc.text('Name of the Bank:', 150, 250)
			doc.text('ICICI', 300, 250)

			doc.text('Payment Date:', 150, 270)
			doc.text('05-08-2014', 300, 270)

			doc.text('Thank you for the payment. Please note that this receipt is issued subjected to realization of cheque. For queries or more information please contact our touch points mentioned below. We value your association with us and assure you the best of our service.', 50, 300)

			doc.text('Warm Regards', 50, 350)
			doc.text('Magnolia Managing Committee', 50, 370)

			doc.moveTo(50,410).lineTo(550, 410);
			doc.stroke();

			doc.fillColor('gray');
			doc.fontSize(8)
			   .text('For queries and more information: Call Us - +91-8087648884 or EMail - magnolia.pashan@gmail.com', 50, 415)

			doc.end();


			res.set({
			  'Content-Disposition': 'attachment; filename="receipt.pdf'
			})
			doc.pipe(res);



	}




};

