var _ =  require('underscore');
var swig = require('swig');
var path = require("path");
var naturalSort = require("javascript-natural-sort");
var nodemailer = require("nodemailer");
var csv = require('csv');
var emailSender = require('../services/email-dispatcher.js');

var ApartmentProvider = require('../models/Apartment.js').ApartmentProvider;

var apartmentProvider = new ApartmentProvider('localhost', 27017);


module.exports = {
    findAll: function (req, res) {
        var apartments = [];
        apartmentProvider.findAll(function (error, apts) {

			apts.forEach(function (apt) {

				var apartment = {			
						"_id": apt._id,
						"flatnumber": apt.flatnumber,
						"gasKYC": apt.gasKYC,
						"maintenanceDueTotal": apt.maintenanceDetails.maintenanceDueTotal,
						"maintenancePaidTotal": apt.maintenanceDetails.maintenancePaidTotal,
						"ownerName" : apt.owner.name,
						"sellableArea" : apt.sellableArea,
						"status" : apt.status
				}

			    apartments.push(apartment);

			});
		
            res.send(apartments);
        })
    },
    getAllAptNo: function (req, res) {
        var apartmentNos = [];
        apartmentProvider.findAll(function (error, apartments) {
            apartments.forEach(function (apartment) {
                apartmentNos.push(apartment.flatnumber);
            });
            apartmentNos.sort(naturalSort);
            res.send(apartmentNos);
        })
    },
    getOwnerByAptNo: function (req, res) {
        apartmentProvider.findById(req.params.id, function (error, apartment) {
            res.send(apartment.owner);
        });
    },
    findById: function (req, res) {
        apartmentProvider.findById(req.params.id, function (error, apartment) {
            res.send(apartment);
        });
    },

    update: function (req, res) {
        var apartment = req.body;
        apartmentProvider.update(apartment, function (error, apartment) {
            if (error) {
                res.send(error, 500);
            } else {
                res.send(apartment);
            }
        });
    },

    sendEmail : function (req, res) {
		var emailObject = req.body;

		if (emailObject.mailToAll) {
				apartmentProvider.findAll(function (error, apartments) {
					if (error) {
						res.send(error, 500);
					} else {
							for (i = 0; i < apartments.length; i++) {
								var apartment = apartments[i];
								var sendEmail = false;
								var emailRecipient = null;
								var emails = [];
								if(emailObject.emailTo == 'All Residents') {
									if (apartment.status == 1) {
										sendEmail = true;
										emailRecipientName = apartment.owner.name;
										if (apartment.owner.emails.length > 0) {
											emails = apartment.owner.emails.filter(function (val) { return val !== null; }).join(", ");
										} 
									}else {
										if (apartment.status == 2) {
											if (apartment.tenant && apartment.tenant.name ) {
												sendEmail = true;
												emailRecipientName = apartment.tenant.name;
												if (apartment.tenant.emails.length > 0) {
													emails = apartment.tenant.emails.filter(function (val) { return val !== null; }).join(", ");
												} 
											}
										}
									}
								}
								if (emailObject.emailTo == 'All Flat Owners') {
									sendEmail = true;
									emailRecipientName = apartment.owner.name;
									if (apartment.owner.emails.length > 0) {
										emails = apartment.owner.emails.filter(function (val) { return val !== null; }).join(", ");
									} 
								}

								if (emailObject.emailTo == 'All Tenants') {
									if (apartment.status == 2) {
										if (apartment.tenant && apartment.tenant.name ) {
											sendEmail = true;
											emailRecipientName = apartment.tenant.name;
											if (apartment.owner.emails.length > 0) {
												emails = apartment.owner.emails.filter(function (val) { return val !== null; }).join(", ");
											} 
										}
									}

								}


								if (sendEmail) {
									var emailData = {
										flatnumber: apartment.flatnumber,
										receipentName: emailRecipientName,
										emailSubject : emailObject.emailSubject,
										emailcontent: emailObject.emailcontent
									}
									emailSender.sendMail('emailTemplate.html', emailObject.emailSubject, emailData, emails);
								}
							}
					}
				});

		}else {
			apartmentProvider.findById(emailObject.flatnumber, function (error, apartment) {

				var sendEmail = false;
				var emailRecipient = null;
				var emails = [];
			

				if (emailObject.emailTo == 'Owner') {
					sendEmail = true;
					emailRecipientName = apartment.owner.name;
					if (apartment.owner.emails.length > 0) {
						emails = apartment.owner.emails.filter(function (val) { return val !== null; }).join(", ");
					} 
				}

				if (emailObject.emailTo == 'Tenant') {
					if (apartment.tenant && apartment.tenant.name ) {
						sendEmail = true;
						emailRecipientName = apartment.tenant.name;
						if (apartment.tenant.emails.length > 0) {
							emails = apartment.tenant.emails.filter(function (val) { return val !== null; }).join(", ");
						} 
					}
				}

				if (emailObject.emailTo == 'Both - Owner & Tenant') {
					sendEmail = true;
					emailRecipientName = apartment.owner.name;
					if (apartment.owner.emails.length > 0) {
						emails = apartment.owner.emails.filter(function (val) { return val !== null; }).join(", ");
					} 
					if (apartment.tenant && apartment.tenant.name ) {
						emailRecipientName = apartment.tenant.name;
						if (apartment.tenant.emails.length > 0) {
							emails = emails + ',' + apartment.tenant.emails.filter(function (val) { return val !== null; }).join(", ");
						} 
					}
				}


				if (sendEmail) {
					var emailData = {
						flatnumber: apartment.flatnumber,
						receipentName: emailRecipientName,
						emailSubject : emailObject.emailSubject,
						emailcontent: emailObject.emailcontent
					}
					emailSender.sendMail('emailTemplate.html', emailObject.emailSubject, emailData, emails);
				}

			});
		}


        res.send(200);

    },

    sendMaintenanceReminderToAll: function (req, res) {
        apartmentProvider.findAll(function (error, apartments) {
            if (error) {
                res.send(error, 500);
            } else {

                for (i = 0; i < apartments.length; i++) {
                    var maintenanceDetails = apartments[i].maintenanceDetails;
                    Number.prototype.format = function (n, x) {
                        var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
                        return this.toFixed(Math.max(0, ~ ~n)).replace(new RegExp(re, 'g'), '$1,');
                    };

                    var maintenanceDueTotal = parseInt(maintenanceDetails.maintenanceDueTotal);
                    var maintenancePaidTotal = parseInt(maintenanceDetails.maintenancePaidTotal);
                    var totalDue = maintenanceDueTotal - maintenancePaidTotal;
                    var paymentDueFlag = false;

                    if (totalDue > 0) {
                        paymentDueFlag = true;
                        var paymentLetterObject = {
                            flatnumber: apartments[i].flatnumber,
                            ownerName: apartments[i].owner.name,
                            salablearea: apartments[i].sellableArea,
                            maintenanceDetails: maintenanceDetails,
                            paymentDueFlag: paymentDueFlag,
                            totalDue: totalDue
                        }
                        var subjectLine = "Maintenance Payment Reminder for " + apartments[i].flatnumber + "@magnolia";
                        var emails = "";
                        if (apartments[i].owner.emails.length > 0) {
                            emails = apartments[i].owner.emails.filter(function (val) { return val !== null; }).join(", ");
                        }
                        emailSender.sendMail('maintenancePaymentReminder.html', subjectLine, paymentLetterObject, emails);
                    }
                }
            }
        });

        res.send(200);

    },

    sendMaintenanceStatementToAll: function (req, res) {
        apartmentProvider.findAll(function (error, apartments) {
            if (error) {
                res.send(error, 500);
            } else {

                for (i = 0; i < apartments.length; i++) {
                    var maintenanceDetails = apartments[i].maintenanceDetails;
                    Number.prototype.format = function (n, x) {
                        var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
                        return this.toFixed(Math.max(0, ~ ~n)).replace(new RegExp(re, 'g'), '$1,');
                    };

                    var maintenanceDueTotal = parseInt(maintenanceDetails.maintenanceDueTotal);
                    var maintenancePaidTotal = parseInt(maintenanceDetails.maintenancePaidTotal);
                    var totalDue = maintenanceDueTotal - maintenancePaidTotal;
                    var paymentDueFlag = false;

                    if (totalDue > 0) {
                        paymentDueFlag = true;
                    }

                    var paymentLetterObject = {
                        flatnumber: apartments[i].flatnumber,
                        ownerName: apartments[i].owner.name,
                        salablearea: apartments[i].sellableArea,
                        maintenanceDetails: maintenanceDetails,
                        paymentDueFlag: paymentDueFlag,
                        totalDue: totalDue
                    }
                    var subjectLine = "Maintenance Payment Summary for " + apartments[i].flatnumber + "@magnolia";
                    var emails = "";
                    if (apartments[i].owner.emails.length > 0) {
                        emails = apartments[i].owner.emails.filter(function (val) { return val !== null; }).join(", ");
                    }
                    emailSender.sendMail('maintenancePaymentStatement.html', subjectLine, paymentLetterObject, emails);
                }
            }
        });

        res.send(200);

    },

    getPaymentDefaulters: function (req, res) {

        var periodName = req.params.id;
        var getDefaulterObject = function (apt) {
            var email1 = "";
            var email2 = "";
            if (apt.owner.emails) {
                if (apt.owner.emails[0]) {
                    email1 = apt.owner.emails[0];
                }
                if (apt.owner.emails[1]) {
                    email2 = apt.owner.emails[1];
                }

            }
            var contactNo1 = "";
            var contactNo2 = "";
            if (apt.owner.phones) {
                if (apt.owner.phones[0]) {
                    contactNo1 = apt.owner.phones[0];
                }
                if (apt.owner.phones[1]) {
                    contactNo2 = apt.owner.phones[1];
                }

            }

            var defaulter = {
                flatnumber: apt.flatnumber,
                ownerName: apt.owner.name,
                email1: email1,
                email2: email2,
                contactNo1: contactNo1,
                contactNo2: contactNo2,
                dues: ''
            }

            return defaulter;
        }



        var defaulters = [];
        apartmentProvider.findAll(function (error, apartments) {
            if (error) {
                res.send(error, 500);
            } else {
                apartments.forEach(function (apt) {
                    var apartment = apt;

                    if (periodName == "all") {
                        var maintenanceDue = parseInt(apt.maintenanceDetails.maintenanceDueTotal);
                        var maintenancePaid = parseInt(apt.maintenanceDetails.maintenancePaidTotal);
                        if (maintenanceDue > maintenancePaid) {
                            defaulter = getDefaulterObject(apt);
                            var dues = maintenanceDue - maintenancePaid;
                            defaulter.dues = 'INR ' + dues;
                            defaulters.push(defaulter);
                        }
                    } else {
                        apt.maintenanceDetails.paymentSummary.forEach(function (paymentSummary) {
                            if (paymentSummary.period == periodName) {
                                var maintenanceDue = parseInt(paymentSummary.maintenanceDue);
                                var maintenancePaid = parseInt(paymentSummary.maintenancePaid);
                                if (maintenanceDue > maintenancePaid) {
                                    defaulter = getDefaulterObject(apt);
                                    var dues = maintenanceDue - maintenancePaid;
                                    defaulter.dues = 'INR ' + dues;
                                    defaulters.push(defaulter);
                                }
                            }
                        });
                    }
                });
                res.send(defaulters);
            }
        });


    },


    getApartmentSummary: function (req, res) {

        var apartmentSummary = {};

        apartmentProvider.findAll(function (error, apartments) {
            if (error) {
                res.send(error, 500);
            } else {


                var totalApartments = apartments.length;
                var occupancyCount = 0;
                var tenantCount = 0;
                var gasKycCount = 0;
                var totalMaintenaceReceivable = 0;
                var totalMaintenacePaid = 0;
                var totalDefaulters = 0;
                var periodReceibale = [];
                var periodPaid = [];
                var periodNames = [];
                var numberOfDefaulters = [];

                var periodArrayInitialized = false;

                for (var i = 0; i < apartments.length; i++) {
                    var apartment = apartments[i];
                    if (apartment.status != 0) {
                        occupancyCount++;
                    }

                    if (apartment.status == 2) {
                        tenantCount++;
                    }

                    if (apartment.gasKYC == 1) {
                        gasKycCount++;
                    }

                    if (!periodArrayInitialized) {
                        periodArrayInitialized = true;
                        for (var j = 0; j < apartment.maintenanceDetails.paymentSummary.length; j++) {
                            periodReceibale[j] = 0;
                            periodPaid[j] = 0;
                            numberOfDefaulters[j] = 0;
                            periodNames[j] = apartment.maintenanceDetails.paymentSummary[j].period;
                        }
                    }

                    totalMaintenaceReceivable += parseInt(apartment.maintenanceDetails.maintenanceDueTotal);
                    totalMaintenacePaid += parseInt(apartment.maintenanceDetails.maintenancePaidTotal);

                    if (parseInt(apartment.maintenanceDetails.maintenanceDueTotal) >
							parseInt(apartment.maintenanceDetails.maintenancePaidTotal)) {
                        totalDefaulters++;
                    }

                    for (var j = 0; j < apartment.maintenanceDetails.paymentSummary.length; j++) {
                        var paymentData = apartment.maintenanceDetails.paymentSummary[j];
                        var maintenanceDue = parseInt(paymentData.maintenanceDue);
                        var maintenancePaid = parseInt(paymentData.maintenancePaid);
                        periodReceibale[j] += maintenanceDue;
                        periodPaid[j] += maintenancePaid
                        if (maintenanceDue > maintenancePaid) {
                            numberOfDefaulters[j]++;
                        }
                    }
                }

                var periodData = [];
                for (var k = 0; k < periodNames.length; k++) {
                    var period = {
                        periodName: periodNames[k],
                        periodTotalDue: periodReceibale[k],
                        periodTotalPaid: periodPaid[k],
                        periodNoOfDefaulters: numberOfDefaulters[k],
                        periodPrctReceived: (periodPaid[k] / periodReceibale[k])
                    }
                    periodData.push(period);
                }

                apartmentSummary = {
                    totalApartments: totalApartments,
                    occupancyCount: occupancyCount,
                    tenantCount: tenantCount,
                    gasKycCount: gasKycCount,
                    totalMaintenaceReceivable: totalMaintenaceReceivable,
                    totalMaintenacePaid: totalMaintenacePaid,
                    totalDefaulters: totalDefaulters,
                    percentageReceived: (totalMaintenacePaid / totalMaintenaceReceivable),
                    periodData: periodData
                }
                res.send(apartmentSummary);
            }
        });


    },

    addNewMaintenancePeriod: function (req, res) {
        var periodData = req.body;
        apartmentProvider.findAll(function (error, apartments) {
            if (error) {
                res.send(error, 500);
            } else {

                for (i = 0; i < apartments.length; i++) {
                    var maintenanceDetails = apartments[i].maintenanceDetails;
                    var maintenanceDue = apartments[i].sellableArea * periodData.maintenanceRate * periodData.periodLength;
                    maintenanceDetails.maintenanceDueTotal = maintenanceDetails.maintenanceDueTotal + maintenanceDue;

                    var newPeriod = {
                        period: periodData.period,
                        maintenanceDue: maintenanceDue,
                        maintenancePaid: 0
                    }
                    maintenanceDetails.paymentSummary.push(newPeriod);

                    apartmentProvider.addMaintenancePeriod(apartments[i], function (error) {
                        if (error) {
                            console.log('error while adding period to' + apartments[i].flatnumber);
                        } else {
                            Number.prototype.format = function (n, x) {
                                var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
                                return this.toFixed(Math.max(0, ~ ~n)).replace(new RegExp(re, 'g'), '$1,');
                            };

                            var maintenanceDueNum = parseInt(maintenanceDue);
                            var paymentLetterObject = {
                                flatNumber: apartments[i].flatnumber,
                                period: periodData.period,
                                ownerName: apartments[i].owner.name,
                                salablearea: apartments[i].sellableArea,
                                totalContribution: maintenanceDueNum.format(2),
                                paymentLastDate: periodData.lastPaymentDateStr
                            }
                            var subjectLine = "Maintenance Request for " + apartments[i].flatnumber + "@magnolia - " + periodData.period;
                            var emails = "";
                            if (apartments[i].owner.emails.length > 0) {
                                emails = apartments[i].owner.emails.filter(function (val) { return val !== null; }).join(", ");
                            }
                            emailSender.sendMail('maintenancePaymentRequest.html', subjectLine, paymentLetterObject, emails);
                        }
                    });



                }
            }
        });

        res.send(200);

    }

};