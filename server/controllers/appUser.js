var _ =           require('underscore');
var AppUsersProvider = require('../models/AppUser.js').AppUsersProvider;
var appUsersProvider = new AppUsersProvider();
var passgen = require('passgen');
var emailSender = require('../services/email-dispatcher.js');

module.exports = {
    findAll: function(req, res) {
	     appUsersProvider.findAll(function(error,appUsers){
            if(!error) {
				  _.each(appUsers, function(user) {
					 delete user.password;
				  });
				  res.send(appUsers);
			}
         })
    },
    findById: function(req, res) {
		appUsersProvider.findById(req.params.id, function(error, user) {
			    delete user.password;
		    	res.send(user);
		});
    },
    findByEmail: function(req, res) {
		appUsersProvider.findByEmail(email, function(error, user) {
			    delete user.password;
		    	res.send(user);
		});
    },
    delete: function(req, res) {
		appUsersProvider.delete(req.params.id, function(error, user) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
			var user = req.body;
			user.password = passgen.create(8);
			appUsersProvider.add(user, function(error, user) {
				  if (error) {
					res.send(error, 404);
				  } else {
                    var userAccountObject = {
                        password: user.password
                    }
                    var subjectLine = "User Account Information" ;
                    var emails = user.username;
                    emailSender.sendMail('newUser.html', subjectLine, userAccountObject, emails);
					res.send(user);
				  }
			});
    },
    update: function(req, res) {
			var user = req.body;
			appUsersProvider.update(user, function(error, result) {			  
			  if (error) {
				res.send(error, 500);
			  } else {
				res.send(result);				
			  }
			}); 
    }

};

