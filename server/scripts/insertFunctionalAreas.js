
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/magnolia', function(err, db) {
  if (err) throw err;
    console.log("Connected to Database");
	db.collection('functionalareas',function(err, collection){
		collection.remove({},function(err, removed){

			console.log("cleaned the collection");
			var areas = [
							{name: 'House Keeping'},
							{name: 'Electrical Equipements'},
							{name: 'Office Supplies'},
				            {name: 'Security'},
				            {name: 'STP'},
				            {name: 'WTP'},
				            {name: 'Gardening'},
     			            {name: 'Communication'},
				            {name: 'Intercom'},
				            {name: 'Legal'},
							{name: 'Administration'},
							{name: 'Finance'},
							{name: 'Accounting'},
							{name: 'Utilities'}
						];

			var l = areas.length;
			for (var i=0; i < l; i++) {
				db.collection('functionalareas').insert(areas[i], function(err, records) {
					if (err) throw err;
					console.log("Record added as "+records[0]._id);
				});
			}
		});
	});

});