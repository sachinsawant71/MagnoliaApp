var moment = require('moment');
var swig = require('swig');
var path = require("path");
var nodemailer = require("nodemailer");
var accounting = require("accounting");
var emailSettings = require('./email-settings.js');
var rootFolder = path.join(__dirname, "email-templates");


var amount = function(value) {
  return accounting.formatNumber(2);
};

accounting.settings = {
	currency: {
		symbol : "",   
		format: "%v", 
		decimal : ".",  
		thousand: ",",  
		precision : 2   
	},
	number: {
		precision : 2,  
		thousand: ",",
		decimal : "."
	}
}

accounting.settings.currency.format = {
	pos : "%v",  
	neg : "(%v)",
	zero: "NIL"  
};

swig.setFilter('amount', function (input) {
  return accounting.formatMoney(parseInt(input));
});


var EM = {};
module.exports = EM;

EM.sendMail = function(mailTemplate,subjetLine,letterObject,emails,callback) {

		var tpl = swig.compileFile(path.join(rootFolder,mailTemplate));

		var smtpTransport = nodemailer.createTransport("SMTP",{
				service: "Gmail",
				auth: {
					user: 'sachinsawant525@gmail.com',
					pass: 'blackberry12#$'
				}
		});


		var mailOptions = {
			from: emailSettings.sender, 
			to: emails,
			subject: subjetLine, 
			generateTextFromHTML: true,
			html: tpl(letterObject)
		}


		if (emails && emails.trim() != "") {
			console.log('mail sent to ' + emails);
			smtpTransport.sendMail(mailOptions, function(error, response){
				if(error){
					console.log(error);
				}else{
					if (callback) {
						callback(response);
					}
				}
				smtpTransport.close();
			});

		}


}

