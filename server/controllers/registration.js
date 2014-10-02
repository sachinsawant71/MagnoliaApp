var fs = require('fs');
var path = require('path');
var RegistrationsProvider = require('../models/Registrations.js').RegistrationsProvider;
var registrationsProvider = new RegistrationsProvider();

module.exports = {
    add: function(req, res) {
			var registration = req.body;
			registrationsProvider.add(registration, function(error, newRegistration) {
			  if (error) {
					res.send(error, 500);
			  } else {
				   res.send(newRegistration);
			  }
			});

    },

    findById: function(req, res) {
        registrationsProvider.findById(req.params.id, function (error, registration) {
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(registration);
		  }
        });

    },

    findAll: function(req, res) {

	   registrationsProvider.count(function(error,count){
		  if (error) {
			  console.log(error);
		  } 
		  registrationsProvider.findAll(req.query.offset,req.query.limit,function(error,registrations){
			res.setHeader('record-count', count);
			res.send(registrations);
		  });
	   });
    },

    delete: function(req, res) {		
        registrationsProvider.findById(req.params.id, function (error, registration) {
		  if (error) {
			res.send(error, 500);
		  } else {
			registrationsProvider.delete(req.params.id, function(error, result) {
				res.send('ok', 200);
			});
		  }
        });
    },

    update: function(req, res) {
		var registration = req.body;
		registrationsProvider.update(registration, function(error, updatedRegistration) {			  
		  if (error) {
			res.send(error, 500);
		  } else {
			res.send(updatedRegistration,200);
		  }
		}); 
    }
};