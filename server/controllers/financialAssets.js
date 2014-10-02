var fs = require('fs');
var path = require('path');
var FinAssetsProvider = require('../models/FinancialAssets.js').FinAssetsProvider;
var finAssetProvider = new FinAssetsProvider();

module.exports = {
    add: function(req, res) {
			var amc = req.body;
			finAssetProvider.add(amc, function(error, newAmc) {
			  if (error) {
					res.send(error, 500);
			  } else {
				   res.send(newAmc);
			  }
			});

    },

    findById: function(req, res) {
        finAssetProvider.findById(req.params.id, function (error, doc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(doc);
		  }
        });

    },

    findAll: function(req, res) {

	   finAssetProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  finAssetProvider.findAll(req.query.offset,req.query.limit,function(error,docs){
			res.setHeader('record-count', count);
			res.send(docs);
		  });
	   });
    },

    delete: function(req, res) {
		
        finAssetProvider.findById(req.params.id, function (error, amc) {
		  if (error) {
			res.send(error, 500);
		  } else {
			finAssetProvider.delete(req.params.id, function(error, result) {
				res.send('ok', 200);
			});
		  }
        });
    }
};