var fs = require('fs');
var path = require('path');
var DocumentProvider = require('../models/Document.js').DocumentProvider;

var documentProvider = new DocumentProvider();

module.exports = {
    upload: function(req, res) {
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
		   res.send(savedDoc);
		  }
		});  
    },

    findById: function(req, res) {
        documentProvider.findById(req.params.id, function (error, doc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			var documentName = doc.filename;
			var fileName = path.join(__dirname,"../../public/uploads/" ,documentName);
			fs.open(fileName, 'r', function(err, fd) {
				if(err) {
					res.send(400);
				} else {
					fs.close(fd);
					res.sendfile(fileName);
				}
			 });
		  }
        });

    },

    findAll: function(req, res) {

	   documentProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  documentProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });
    },

    delete: function(req, res) {
		
        documentProvider.findById(req.params.id, function (error, doc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			var documentName = doc.filename;
			var fileName = path.join(__dirname,"../../public/uploads/" ,documentName);
			fs.exists(fileName, function (exists) {
				fs.unlink(fileName, function (err) {
					if (error) {
						  console.log(error);
						  //response.errors.push("Erorr : " + err);
					} 
					documentProvider.delete(req.params.id, function(error, result) {
						res.send('ok', 200);
					});
				}); 
			});

		  }
        });
    }
};