var fs = require('fs');
var path = require('path');
var AmcProvider = require('../models/Amc.js').AmcProvider;
var amcProvider = new AmcProvider('localhost', 27017);

var DocumentProvider = require('../models/Document.js').DocumentProvider;
var documentProvider = new DocumentProvider('localhost', 27017);

module.exports = {
    add: function(req, res) {
		var doc = {};
		doc.documentName = req.body.documentName;
		doc.documentDescription = req.body.documentDescription;
		doc.accessLevel = req.body.accessLevel;
		doc.flatnumber = req.body.flatnumber;
		doc.createdTimestamp = new Date();
		doc.filename = req.files.file.name;
		documentProvider.add(doc, function(error, savedDoc) {
		  if (error) {
			res.send(error, 500);
		  } else {		   
				var amc = {};
				amc.vendorName = req.body.vendorName;
				amc.startDate = new Date(req.body.startDate);
				amc.endDate = new Date(req.body.endDate);
				amc.cost = req.body.cost;
				amc.contractDoc = {
					 documentId : savedDoc._id,
			         documentName : savedDoc.documentName,
			         createdDate : savedDoc.createdTimestamp,
			         documentDescription : savedDoc.documentDescription
				}
				amcProvider.add(amc, function(error, savedDoc) {
					  if (error) {
						 res.send(error, 500);
					  } else {	
						 res.send(amc);
					  }
				});

		  }
		});  
    },

    findById: function(req, res) {
        amcProvider.findById(req.params.id, function (error, doc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(doc);
		  }
        });

    },

    findAll: function(req, res) {

	   amcProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  amcProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });
    },

    delete: function(req, res) {
		
        amcProvider.findById(req.params.id, function (error, doc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			var documentId = doc.contractDoc.documentId;
			documentProvider.delete(documentId.toString(), function(error, result) {
			});
			amcProvider.delete(req.params.id, function(error, result) {
				res.send('ok', 200);
			});
		  }
        });
    }
};