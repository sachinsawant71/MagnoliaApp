var _ =           require('underscore');
var FunctionalAreaProvider = require('../models/FunctionalAreas.js').FunctionalAreaProvider;
var functionalAreaProvider = new FunctionalAreaProvider('localhost', 27017);


module.exports = {
    findAll: function(req, res) {
		 functionalAreaProvider.findAll(function(error,functionalArea){
			res.send(functionalArea);
		  });
    },
    findById: function(req, res) {
		functionalAreaProvider.findById(req.params.id, function(error, functionalArea) {
			res.send(functionalArea);
		});
    },
    delete: function(req, res) {
		functionalAreaProvider.delete(req.params.id, function(error, functionalArea) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
		var functionalArea = req.body;
		functionalAreaProvider.add(functionalArea, function(error, functionalArea) {
		  if (error) {
			res.send(error, 404);
		  } else {
		   res.send(functionalArea);
		  }
		});
    }

};

