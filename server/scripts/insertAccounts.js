var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/magnolia', function(err, db) {
  if (err) throw err;
    console.log("Connected to Database");
	db.collection('users',function(err, collection){
		collection.remove({},function(err, removed){

			console.log("cleaned the collection");
			var accounts = [
							{username: 'admin@magnolia.com', password: 'unicorn', role: { "bitMask": 4, "title": 'admin' },apartmentnumber : "all" },
							{username: 'sachin_sawant71@yahoo.com', password: 'magnolia1', role: { "bitMask": 2, "title": 'user' }, apartmentnumber : "D-105"},
							];

			var l = accounts.length;
			for (var i=0; i < l; i++) {
				db.collection('users').insert(accounts[i], function(err, records) {
					if (err) throw err;
					console.log("Record added as "+records[0]._id);
				});
			}
		});
	});

});