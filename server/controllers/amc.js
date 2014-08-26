var fs = require('fs');
var path = require('path');
var AmcProvider = require('../models/Amc.js').AmcProvider;
var amcProvider = new AmcProvider('localhost', 27017);

var DocumentProvider = require('../models/Document.js').DocumentProvider;
var documentProvider = new DocumentProvider('localhost', 27017);

module.exports = {
    add: function(req, res) {
			var amc = req.body;
			amcProvider.add(amc, function(error, newAmc) {
			  if (error) {
					res.send(error, 500);
			  } else {
				   res.send(newAmc);
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
		
        amcProvider.findById(req.params.id, function (error, amc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			amc.documents.forEach(function (doc) {
				var documentId = doc.documentId;
				documentProvider.delete(documentId.toString(), function(error, result) {
				});
			});
			amcProvider.delete(req.params.id, function(error, result) {
				res.send('ok', 200);
			});
		  }
        });
    }
};