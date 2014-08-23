var _ =           require('underscore');
var MembersProvider = require('../models/Members.js').MembersProvider;
var ApartmentProvider = require('../models/Apartment.js').ApartmentProvider;
var membersProvider = new MembersProvider('localhost', 27017);
var apartmentProvider = new ApartmentProvider('localhost', 27017);
var async = require("async");

var populateMemberData = function (member, doneCallback) {
        var flatNo = member.flatNo;
        apartmentProvider.findById(flatNo, function (error, apartment) {
            if (!member.isCoonwer) {
                member.memberName = apartment.owner.name;
                member.contactNumber = apartment.owner.phones[0];
                member.emailId = apartment.owner.emails[0];                            
            } else {
                member.memberName = apartment.owner.coowner.name;
                member.contactNumber = apartment.owner.coowner.phone;
                member.emailId = apartment.owner.coowner.email;
            }
            return doneCallback(null);
        });
          
};

module.exports = {
    findAll: function(req, res) {

	     membersProvider.findAll(function(error,members){
            if(!error) {
               async.each(members, populateMemberData, function (err) {
                   res.send(members);
               });
               
            }
       })
    },

    findById: function(req, res) {
			membersProvider.findById(req.params.id, function(error, member) {
			res.send(apartment);
		});
    },
    delete: function(req, res) {
		    membersProvider.delete(req.params.id, function(error, member) {
			res.send('ok', 200);
		});
    },
    add: function(req, res) {
			var member = req.body;
			membersProvider.add(member, function(error, member) {
			  if (error) {
				res.send(error, 404);
			  } else {
                    var flatNo = member.flatNo;
                    apartmentProvider.findById(flatNo, function (error, apartment) {
                        if (!member.isCoonwer) {
                            member.memberName = apartment.owner.name;
                            member.contactNumber = apartment.owner.phones[0];
                            member.emailId = apartment.owner.emails[0];                            
                        } else {
                            member.memberName = apartment.owner.coowner.name;
                            member.contactNumber = apartment.owner.coowner.phone;
                            member.emailId = apartment.owner.coowner.email;
                        }
                            res.send(member);
                    });
        		  
			  }
			});
    },
    update: function(req, res) {
			var member = req.body;
			membersProvider.update(member, function(error, updatedMember) {			  
			  if (error) {
				res.send(error, 500);
			  } else {
                    var flatNo = updatedMember.flatNo;
                    apartmentProvider.findById(flatNo, function (error, apartment) {
                        if (!updatedMember.isCoonwer) {
                            updatedMember.memberName = apartment.owner.name;
                            updatedMember.contactNumber = apartment.owner.phones[0];
                            updatedMember.emailId = apartment.owner.emails[0];                            
                        } else {
                            updatedMember.memberName = apartment.owner.coowner.name;
                            updatedMember.contactNumber = apartment.owner.coowner.phone;
                            updatedMember.emailId = apartment.owner.coowner.email;
                        }
                            res.send(updatedMember);
                    });
				
			  }
			}); 
    }

};

