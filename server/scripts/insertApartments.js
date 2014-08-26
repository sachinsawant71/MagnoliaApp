var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/magnolia', function(err, db) {
  if (err) throw err;
    console.log("Connected to Database");
	db.collection('apartmentData',function(err, collection){
		collection.remove({},function(err, removed){
			console.log("cleaned the collection");
			var accounts = [
						{"buildupArea":1110,"carpetArea":888,"flatnumber":"A-101","gasKYC":"0","maintenanceDetails":{"maintenanceDueTotal":164320,"maintenancePaidTotal":164320,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":12640,"maintenancePaid":15168,"notes":["Check(161228) Payment on 5/11/09 for INR 15,168"]},{"period":"Apr-2010-Mar-2011","maintenanceDue":30336,"maintenancePaid":30336,"notes":["Online Transfer on 26/4/10 for INR 15,168","Online Transfer on 23/11/10 for INR 15,168"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":30336,"maintenancePaid":27808,"notes":["Online Transfer on 12/5/11 for INR 12,640","Online Transfer on 13/10/11 for INR 15,168"]},{"period":"Apr-2012-Mar-2013","maintenanceDue":34128,"maintenancePaid":34128,"notes":["Check(856921) Payment on 4/5/12 for INR 15,168","Check(856925) Payment on 15/10/12 for INR 18,960"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":37920,"maintenancePaid":37920,"notes":["Check(879591) Payment on 9/10/13 for INR 18,960","Check(879589) Payment on 10/4/13 for INR 18,960"]},{"period":"Apr-2014-Sep-2014","maintenanceDue":18960,"maintenancePaid":18960,"notes":["Online Transfer on 3/5/14 for INR 18,960"]}]},"notes":"","owner":{"name":"Rajesh Korde","coOwnerName":null,"address":"","emails":["dattatraypradhan@hotmail.com",null],"phones":["9822888646","20 2538 4094"],"vehicles":[]},"propertyTax":"O/4/11/03052002","sellableArea":"1264","status":"0","tenant":{},"terraceArea":247,"votingRights":"0.38"},
						{"flatnumber":"A-102","gasKYC":"1","maintenanceDetails":{"maintenanceDueTotal":165490,"maintenancePaidTotal":30552,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":12730,"maintenancePaid":0,"notes":[]},{"period":"Apr-2010-Mar-2011","maintenanceDue":30552,"maintenancePaid":15276,"notes":["Check(542817) Payment on 8/12/10 for INR 15,276"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":30552,"maintenancePaid":0,"notes":[]},{"period":"Apr-2012-Mar-2013","maintenanceDue":34371,"maintenancePaid":15276,"notes":["Check(911676) Payment on 16/5/12 for INR 15,276"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":38190,"maintenancePaid":0,"notes":[]},{"period":"Apr-2014-Sep-2014","maintenanceDue":19095,"maintenancePaid":0,"notes":[]}]},"notes":"","owner":{"name":"Dangat Pandurang Bhikoba ","address":"","emails":["amit.pandurang83@gmail.com",null],"phones":["(93733) 27767",""],"coowner":{}},"sellableArea":"1273","status":1,"tenant":{},"propertyTax":"O/4/11/03052238","buildupArea":1110,"carpetArea":888,"terraceArea":260,"votingRights":"0.38"}
					];

			var l = accounts.length;
			for (var i=0; i < l; i++) {
				db.collection('apartmentData').insert(accounts[i], function(err, records) {
					if (err) throw err;
					console.log("Record added as "+records[0]._id);
				});
			}
		});
	});

});














