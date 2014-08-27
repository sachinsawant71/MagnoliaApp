var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/magnolia', function(err, db) {
  if (err) throw err;
    console.log("Connected to Database");
	db.collection('apartmentData',function(err, collection){
		collection.remove({},function(err, removed){
			console.log("cleaned the collection");
			var accounts = [
						{"flatnumber":"A-101","gasKYC":"1","maintenanceDetails":{"maintenanceDueTotal":165490,"maintenancePaidTotal":30552,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":12730,"maintenancePaid":0,"notes":[]},{"period":"Apr-2010-Mar-2011","maintenanceDue":30552,"maintenancePaid":15276,"notes":["Check(542817) Payment on 8/12/10 for INR 15,276"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":30552,"maintenancePaid":0,"notes":[]},{"period":"Apr-2012-Mar-2013","maintenanceDue":34371,"maintenancePaid":15276,"notes":["Check(911676) Payment on 16/5/12 for INR 15,276"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":38190,"maintenancePaid":0,"notes":[]},{"period":"Apr-2014-Sep-2014","maintenanceDue":19095,"maintenancePaid":0,"notes":[]}]},"notes":"","owner":{"name":"Dangat Pandurang Bhikoba ","address":"","emails":["amit.pandurang83@gmail.com",null],"phones":["(93733) 27767",""],"coowner":{}},"sellableArea":"1273","status":1,"tenant":{},"propertyTax":"O/4/11/03052238","buildupArea":1110,"carpetArea":888,"terraceArea":260,"votingRights":"0.38"},
			            {"flatnumber":"A-102","gasKYC":0,"maintenanceDetails":{"maintenanceDueTotal":193570,"maintenancePaidTotal":196548,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":14890,"maintenancePaid":17868,"notes":["Check(13184) Payment on 31/8/09 for INR 17,868"]},{"period":"Apr-2010-Mar-2011","maintenanceDue":35736,"maintenancePaid":53604,"notes":["Check(34415) Payment on 29/4/10 for INR 17,868","Check(77907) Payment on 15/12/10 for INR 35,736"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":35736,"maintenancePaid":17868,"notes":["Check(361564) Payment on 9/11/11 for INR 17,868"]},{"period":"Apr-2012-Mar-2013","maintenanceDue":40203,"maintenancePaid":40203,"notes":["Check(345577) Payment on 11/4/12 for INR 17,868","Check(361603) Payment on 7/12/12 for INR 22,335"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":44670,"maintenancePaid":44670,"notes":["Check(361611) Payment on 24/4/13 for INR 22,335","Check(18926) Payment on 31/1/13 for INR 22,335"]},{"period":"Apr-2014-Sep-2014","maintenanceDue":22335,"maintenancePaid":22335,"notes":["Check(331361) Payment on 27/6/14 for INR 22,335"]}]},"notes":"","owner":{"name":"Rashmi Ramesh Patil","address":"","emails":["rashmi.patil@gmail.com"],"phones":["9899787220",""],"coowner":{}},"sellableArea":"1489","status":1,"tenant":{"emails":[],"phones":[]},"propertyTax":"O/4/11/03052051","buildupArea":1369,"carpetArea":1095,"terraceArea":192,"votingRights":"0.47"},
						{"flatnumber":"A-103","gasKYC":0,"maintenanceDetails":{"maintenanceDueTotal":193960,"maintenancePaidTotal":171580,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":14920,"maintenancePaid":17904,"notes":["Check(59908) Payment on 30/3/10 for INR 17,904"]},{"period":"Apr-2010-Mar-2011","maintenanceDue":35808,"maintenancePaid":35808,"notes":["Check(72080) Payment on 13/9/10 for INR 17,904","Check(72127) Payment on 8/2/11 for INR 17,904"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":35808,"maintenancePaid":35808,"notes":["Check(72169) Payment on 18/7/11 for INR 17,904","Check(79653) Payment on 25/10/11 for INR 17,904"]},{"period":"Apr-2012-Mar-2013","maintenanceDue":40284,"maintenancePaid":37300,"notes":["Online Transfer on 7/6/12 for INR 17,904","Online Transfer on 25/3/13 for INR 19,396"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":44760,"maintenancePaid":44760,"notes":["Online Transfer on 5/4/13 for INR 22,380","Online Transfer on 5/10/13 for INR 22,380"]},{"period":"Apr-2014-Sep-2014","maintenanceDue":22380,"maintenancePaid":0,"notes":[]}]},"notes":"","owner":{"name":"Mahesh Dinesh Ghutake","address":"","emails":["mahesh.ghutake@yahoo.co.in","mahesh1@gmail.com"],"phones":["9892292903","9862298175"],"coowner":{}},"sellableArea":"1492","status":1,"tenant":{"emails":[],"phones":[]},"propertyTax":"0/4/11/03052110","buildupArea":1369,"carpetArea":1095,"terraceArea":197,"votingRights":"0.47"},
				        {"flatnumber":"A-104","gasKYC":0,"maintenanceDetails":{"maintenanceDueTotal":193570,"maintenancePaidTotal":160812,"paymentSummary":[{"period":"Nov-2009-Mar-2010","maintenanceDue":14890,"maintenancePaid":17868,"notes":["Check(421580) Payment on 4/11/09 for INR 17,868"]},{"period":"Apr-2010-Mar-2011","maintenanceDue":35736,"maintenancePaid":17868,"notes":["Check(421588) Payment on 5/5/10 for INR 17,868"]},{"period":"Apr-2011-Mar-2012","maintenanceDue":35736,"maintenancePaid":0,"notes":[]},{"period":"Apr-2012-Mar-2013","maintenanceDue":40203,"maintenancePaid":58071,"notes":["Check(806499) Payment on 4/7/12 for INR 17,868","Check(806498) Payment on 4/7/12 for INR 17,868","Check(123870) Payment on 30/10/12 for INR 22,335"]},{"period":"Apr-2013-Mar-2014","maintenanceDue":44670,"maintenancePaid":44670,"notes":["Check(123877) Payment on 21/8/13 for INR 22,335","Check(429626) Payment on 27/11/13 for INR 22,335"]},{"period":"Apr-2014-Sep-2014","maintenanceDue":22335,"maintenancePaid":22335,"notes":["Check(429630) Payment on 19/6/14 for INR 22,335"]}]},"notes":"","owner":{"name":"Atul Ramdasi","address":"","emails":["atul.ramdesi@gmail.com"],"phones":["9845452920","9923622492"],"coowner":{}},"sellableArea":"1489","status":1,"tenant":{"emails":[],"phones":[]},"propertyTax":"O/4/11/03052178","buildupArea":1369,"carpetArea":1095,"terraceArea":192,"votingRights":"0.47"}
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














