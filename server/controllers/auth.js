var passport =  require('passport')
    , User = require('../models/User.js');

var AppUsersProvider = require('../models/AppUser.js').AppUsersProvider;
var appUsersProvider = new AppUsersProvider();
var bcrypt        = require('bcrypt-nodejs');
var crypto        = require('crypto');           // http://nodejs.org/api/crypto.html#crypto_crypto
var emailSender = require('../services/email-dispatcher.js');

module.exports = {
    register: function(req, res, next) {
        try {
            User.validate(req.body);
        }
        catch(err) {
            return res.send(400, err.message);
        }

        User.addUser(req.body.username, req.body.password, req.body.role, function(err, user) {
            if(err === 'UserAlreadyExists') return res.send(403, "User already exists");
            else if(err)                    return res.send(500);

            req.logIn(user, function(err) {
                if(err)     { next(err); }
                else        { res.json(200, { "role": user.role, "username": user.username }); }
            });
        });
    },

    forgot: function(req, res) {
			var userEmail = req.body.email;				
			appUsersProvider.findByEmail(userEmail, function(error, user) {
				  if (error) {
					res.send(error, 400);
				  } else {
					if (!user) {
					  res.send(400);
					} else {
					    crypto.randomBytes(21, function(err, buf) {
							var token = buf.toString('hex');
							bcrypt.genSalt(10, function(err, salt) {
								  bcrypt.hash(token, salt, null, function(err, hash) {
								  var hour = 3600000;
								  var expiration = (hour * 4);

								  user.resetPasswordToken = hash;
								  user.resetPasswordExpires = Date.now() + expiration;

								  // update the user's record with the token
								  console.log(user);
								  appUsersProvider.updateResetPasswordToken(user,function(err) {
										if (err) {
										  res.send(400,{ msg: 'Sorry! We encountered an error while re-setting your password. Please contact your administrator.' });
										}
										var accountResetObject = {
											resetLink:     req.protocol + '://' + req.headers.host + '/reset/' + user.username + '/' + token
										}
										var subjectLine = "Password Reset Information" ;
										var emails = user.username;
										emailSender.sendMail('passwordReset.html', subjectLine, accountResetObject, emails);
										res.send(200);
								  });
							  });
							});
						});						
					}					
				  }
			});

    },

    login: function(req, res, next) {
        passport.authenticate('local', function(err, user) {
            if(err)     { return next(err); }
            if(!user)   { return res.send(400); }


            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }

                if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                res.json(200, { "role": user.role, "username": user.username, "apartmentnumber" : user.apartmentnumber});
            });
        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();
        res.send(200);
    }
};