'use strict';

/* Controllers */

angular.module('magnoliaApp')
.controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    $scope.logout = function() {
        Auth.logout(function() {
            $location.path('/login');
        }, function() {
            $rootScope.error = "Failed to logout";
        });
    };
}]);

angular.module('magnoliaApp')
.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

    $scope.rememberme = true;
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberme: $scope.rememberme
            },
            function(res) {
				console.log(Auth.user.role);
				if (Auth.user.role.bitMask ==4) {
					$location.path('/admin/dashboard');
				}
                if (Auth.user.role.bitMask ==2) {
					$location.path('/user/details');
				}
            },
            function(err) {
                $rootScope.error = "Failed to login. Invalid UserId/Password.";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

angular.module('magnoliaApp')
.controller('RegisterCtrl',
['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.role = Auth.userRoles.user;
    $scope.userRoles = Auth.userRoles;

    $scope.register = function() {
        Auth.register({
                username: $scope.username,
                password: $scope.password,
                role: $scope.role
            },
            function() {
                $location.path('/');
            },
            function(err) {
                $rootScope.error = err;
            });
    };
}]);

angular.module('magnoliaApp')
.controller('AdminCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
    $scope.loading = true;
    $scope.userRoles = Auth.userRoles;

    Users.getAll(function(res) {
        $scope.users = res;
        $scope.loading = false;
    }, function(err) {
        $rootScope.error = "Failed to fetch users.";
        $scope.loading = false;
    });

}]);


angular.module('magnoliaApp')
.controller('ApartmentCtrl',['$scope','$filter','$http','AlertService','Apartments',function($scope, $filter,$http,AlertService,Apartments) {
    $scope.items = [];

    Apartments.query(function(response) {
      $scope.items = response;	  
    });

	$scope.sortByAmount = function() {
		$scope.sortorder = "sortAmoutFunction";
	}

	$scope.sortAmoutFunction = function(item) {
		return -(item.maintenanceDetails.maintenanceDueTotal- item.maintenanceDetails.maintenancePaidTotal);
	};

	$scope.predicateBlueChip = $scope.natural('flatnumber');

	$scope.currentApartment = {}; 

    $scope.filterdata ="";
	$scope.addFilter = function(item) {

		if ($scope.filterdata==""){
			return true;
		}

		if (($scope.filterdata=="kyc-done") && (item.gasKYC=="1")){
			return true;
		}

		if (($scope.filterdata=="kyc-pending") && (item.gasKYC=="0")){
			return true;
		}

		if (($scope.filterdata=="owner") && (item.status=="1")){
			return true;
		}

		if (($scope.filterdata=="tenant") && (item.status=="2")){			
			return true;
		}

		if (($scope.filterdata=="empty") && (item.status=="0")){
			return true;
		}

		if (($scope.filterdata=="defaulter") && 
			(item.maintenanceDetails.maintenanceDueTotal-
				item.maintenanceDetails.maintenancePaidTotal > 0)){
			return true;
		}

		return false;
	}

	$scope.getClassNameForAmount = function(item) {
		var diff = item.maintenanceDueTotal-
				item.maintenancePaidTotal;
		if (diff > 0){
			return "amount-red";
		} 

		return "amount-green";
		
	};

	$scope.toggleItem = function(item) {
        $scope.active = item;
    };

	

}]);

angular.module('magnoliaApp')
.controller('ModalNewApartmentCtrl',['$scope','$modal','$timeout','Apartments',function($scope, $modal,$timeout,Apartments) {

	$scope.alerts = [
        {"msg":"Maintenace Pending","type":"error"},
		 {"msg":"KYC Not done","type":"warning"}];


	$scope.open = function (apt) {
		console.log($scope.currentApartment);
		$scope.selectedApartment = apt;
		console.log('before ' + apt.status);
		Apartments.get({id:apt.flatnumber},function(item) {
			//$scope.item = item;
			var modalInstance = $modal.open({
			  scope : $scope,
			  templateUrl: 'newApartmentModal',
              backdrop: 'static',
			  controller: 'ModalInstanceNewApartmentCtrl',
			  windowClass : 'modal-huge',
			  resolve: {
				item: function () {
				  return item;
				}
			  }
			});

			modalInstance.result.then(function () {
				console.log('saved');
			}, function () {
				console.log("canceled");
			});

		});
	};

}]);

angular.module('magnoliaApp')
.controller('ModalInstanceNewApartmentCtrl',['$scope','$modalInstance','item','$filter','FileUploader','Apartments','Documents','$window','AlertService',
				function($scope, $modalInstance, item,$filter,FileUploader,Apartments,Documents,$window,AlertService) {

  $scope.currentApartment = item;
  $scope.vehicle = {};
  $scope.vehicle.vehicleNo = '';
  $scope.vehicle.vehicleType = 0;
  $scope.todayDate = new Date();

  if (!$scope.currentApartment.tenant.vehicles) {
	  $scope.currentApartment.tenant.vehicles = new Array();
  }

  if (!$scope.currentApartment.owner.vehicles) {
	  $scope.currentApartment.owner.vehicles = new Array();
  }

  $scope.messageText = '';

  $scope.selectTemplate = function (index) {
      $scope.messageText = items[index].template;
  };

  $scope.resetTenantAddress = function() {
	$scope.currentApartment.owner.address = '';
	$scope.currentApartment.tenant = new Object();
	$scope.currentApartment.tenant.emails = new Array();
	$scope.currentApartment.tenant.phones = new Array();
	$scope.currentApartment.tenant.vehicles = new Array();
  };

  $scope.addVehicleOwner = function() {
        $scope.currentApartment.owner.vehicles.push({
            vehicleNo: $scope.vehicle.vehicleNo,
            vehicleType: $scope.vehicle.vehicleType,
        });

        $scope.vehicle.vehicleNo = '';
        $scope.vehicle.vehicleType = 0;
  }

  $scope.deleteVehicleOwner = function (veh) {
        var index = $scope.currentApartment.owner.vehicles.indexOf(veh);
        if (index != -1) {
          $scope.currentApartment.owner.vehicles.splice(index, 1);
        }
   }


   $scope.addVehicleTenant = function() {
        $scope.currentApartment.tenant.vehicles.push({
            vehicleNo: $scope.vehicle.vehicleNo,
            vehicleType: $scope.vehicle.vehicleType,
        });

        $scope.vehicle.vehicleNo = '';
        $scope.vehicle.vehicleType = 0;
  }

  $scope.deleteVehicleTenant = function (veh) {
        var index = $scope.currentApartment.tenant.vehicles.indexOf(veh);
        if (index != -1) {
          $scope.currentApartment.tenant.vehicles.splice(index, 1);
        }
   }

   if (!$scope.currentApartment.documents) {
	   $scope.currentApartment.documents = [];
   }

  $scope.doc = {};

  var uploader = $scope.uploader = new FileUploader({
            scope: $scope,        
            url: '/api/upload',
			removeAfterUpload: true,
            formData: [
                { 
				  documentName: $scope.doc.documentName,
				  documentDescription: $scope.doc.documentDescription,
				  accessLevel: 'Admin',
				  flatnumber : $scope.currentApartment.flatnumber
				}
            ]
  });

  uploader.onAfterAddingFile = function(fileItem) {
         $scope.doc.documentName = fileItem.file.name;
		 $scope.doc.documentDescription = fileItem.file.name;
  };

  uploader.onSuccessItem = function(fileItem, response, status, headers) {
        var uploadedDoc = {
			  documentId : response._id,
			  documentName: $scope.doc.documentName,
			  createdDate: response.createdTimestamp,
			  documentDescription: $scope.doc.documentDescription

		}		
		$scope.currentApartment.documents.push(uploadedDoc);
  };

  uploader.onBeforeUploadItem = function(item) {
		item.formData[0].documentName = $scope.doc.documentName;
		item.formData[0].documentDescription = $scope.doc.documentDescription;
		item.formData[0].accessLevel = 'Admin';
		item.formData[0].flatnumber = $scope.currentApartment.flatnumber

  };

  $scope.getDoc = function(item) {
		   $window.open("/api/documents/" + item.documentId);	
  }

  $scope.removeDocument = function (item) {	
  	Documents.remove({id: item.documentId}, function() {
		$scope.currentApartment.documents.splice(item);
    });
  };


  $scope.ok = function () {
	Apartments.get({id:item.flatnumber},function(apartment) {
		apartment.gasKYC = item.gasKYC;
		apartment.status = item.status;
		apartment.propertyTax = item.propertyTax;
		apartment.owner.name = item.owner.name;
        apartment.owner.coOwnerName = item.owner.coOwnerName;
		apartment.owner.address = item.owner.address;
		apartment.owner.emails[0] = item.owner.emails[0];
		apartment.owner.emails[1] =  item.owner.emails[1];
		apartment.owner.phones[0] = item.owner.phones[0];
		apartment.owner.phones[1] =  item.owner.phones[1];
		apartment.owner.vehicles = item.owner.vehicles.slice(0);	
		apartment.documents = item.documents;	

		if (item.status=="2"){		
			apartment.tenant=new Object();
			apartment.tenant.name = item.tenant.name;
			apartment.tenant.address = item.tenant.address;
			apartment.tenant.emails = new Array();
			apartment.tenant.emails[0] = item.tenant.emails[0];
			apartment.tenant.phones = new Array();
			apartment.tenant.phones[0] = item.tenant.phones[0];
			apartment.tenant.phones[1] = item.tenant.phones[1];
			apartment.tenant.policeverification = item.tenant.policeverification
			apartment.tenant.agreement = item.tenant.agreement
			apartment.tenant.registration =	item.tenant.registration
		}
		apartment.$save();
		$scope.selectedApartment.gasKYC = $scope.currentApartment.gasKYC;
		$scope.selectedApartment.status = $scope.currentApartment.status;
		$scope.selectedApartment.ownerName = $scope.currentApartment.owner.name;	
		AlertService.clear();
		AlertService.success('Information for apartment ' + item.flatnumber + ' is updated');
	});

    $modalInstance.close($scope.messageText);
  };

  $scope.cancel = function () {
	$modalInstance.dismiss('cancel');	
  };


  $scope.getClassName = function() {
	var diff = item.maintenanceDetails.maintenanceDueTotal-
			item.maintenanceDetails.maintenancePaidTotal;
	if (diff > 0){
		return "red";
	} 

	return "green";
	
  };


}]);

angular.module('magnoliaApp')
.controller('ModalReceiptReconcileCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	$scope.open = function (index,item) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'receiptReconcileModal',
		  windowClass : 'modal-huge',
		  scope : $scope,
          backdrop: 'static',
		  controller: 'ModalInstanceReceiptReconcileCtrl',		
		  resolve: {
			item: function () {
			  return {"item" : item};
			}
		  }
		});

		modalInstance.result.then(function () {
			console.log('Ok from model Instance');	
		}, function () {
			console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceReceiptReconcileCtrl',['$scope','$modalInstance','item','$filter','Apartments','Receipts','AlertService',function($scope, $modalInstance, item,$filter,Apartments,Receipts,AlertService) {

	  $scope.confirm = function () {	

		$scope.item.status = '1';
		var params = {id: $scope.item._id};
		$scope.item.$update(params,function() {
			AlertService.clear();
			AlertService.success('Receipt confirmed');
		});
		$modalInstance.close();

	  };

	  $scope.reject = function () {	
		$scope.receipt.status = '2';
		Receipts.update({_id:$scope.receipt._id},$scope.receipt);
		$modalInstance.close();
	  };

	  $scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	  };

}]);


angular.module('magnoliaApp')
.controller('ModalReceiptCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	var openConfirmationDialog = function (item,receipt) {
		$scope.receipt = receipt;
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'receiptConfirmationModal',
		  windowClass : 'modal-huge',
          backdrop: 'static',
		  scope : $scope,
		  controller: 'ReceiptConfirmationCtrl',		
		  resolve: {
			item: function () {
			  return {"item" : item,"receipt" : receipt};
			}
		  }
		});

		modalInstance.result.then(function (selectedItem) {
			console.log("saved");
		}, function () {
			console.log("canceled");
		});
	};

	$scope.open = function (item,index,receipt) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'receiptModal',
		  windowClass : 'modal-huge',
          backdrop: 'static',
		  scope : $scope,
		  controller: 'ModalInstanceReceiptCtrl',		
		  resolve: {
			item: function () {
			  return {"item" : item,"receipt" : receipt};
			}
		  }
		});

		modalInstance.result.then(function (data) {
			$scope.receipt = data;
			openConfirmationDialog(item,$scope.receipt);
			
		}, function () {
			console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceReceiptCtrl',['$scope','$modalInstance','item','$filter','Apartments','Receipts',function($scope, $modalInstance, item,$filter,Apartments,Receipts) {

  $scope.item = item.item;
  $scope.banks =  ['ICICI Bank','IDBI Bank','SBI Bank','Punjab National Bank','HDFC Bank','Saraswat Bank','Kotak Mahindra Bank','Yes Bank','Allahabad Bank',
	'Andhra Bank','Bank of Baroda','Bank of India', 'Bank of Maharastra','Bhartiya Mahila Bank','Canara Bank','Central Bank of India','Corporation Bank',
	'Dena Bank','Indian Bank','Indian Overseas Bank','Oriental Bank of Commerce','Punjab and Sind Bank','Syndicate Bank','UCO Bank','Union Bank of India',
	'United Bank of India','Vijaya Bank','State Bank of India','State Bank of Bikaner & Jaipur','State Bank of Hyderabad','State Bank of Mysore','State Bank of Patiala',
	'State Bank of Travancore','IndusInd Bank','ING Vysya Bank','Karnataka Bank','Karur Vysya Bank','Lakshmi Vilas Bank','Nainital Bank','Tamilnadu Mercantile Bank',
	'Dhanlaxmi Bank','Federal Bank','City Union Bank','Development Credit Bank','BNP Paribas','HSBC','Citibank N.A.'];



  if (!!item.receipt) {
	$scope.receipt = item.receipt;	
	Apartments.get({id:item.receipt.flatnumber},function(apartment) {
		$scope.item = apartment;		
	});	
	$scope.readonly = true;
  }else {
	$scope.receipt = {};
	$scope.readonly = false;
	$scope.receipt.receiptMode = "Check";
	$scope.periods = [];
	$scope.receipt.residentStatus = '1';
	
	if ($scope.item) {		

		Apartments.get({id:$scope.item.flatnumber},function(apartment) {
			var periodData = apartment.maintenanceDetails.paymentSummary;
			for (var i = periodData.length - 1; i > -1  ; i--)	{
				var periodDetails = periodData[i];
				$scope.periods.push(periodDetails.period);
			}
			$scope.ownerName = apartment.owner.name;
			$scope.ownerEmailId = apartment.owner.emails[0];

		    $scope.receipt.partyName = $scope.ownerName;
            $scope.emailId = $scope.ownerEmailId;

			if(apartment.status == 2) {
				$scope.tenantName = apartment.tenant.name;
				$scope.tenantEmailId = apartment.tenant.emails[0];
			}
			
		});	
	}	

  } 

  $scope.changeResidentStatus = function () {	
	  if ($scope.receipt.residentStatus == '1')  {
		 $scope.receipt.partyName = $scope.ownerName;
         $scope.emailId = $scope.ownerEmailId;
	  } else {
		 $scope.receipt.partyName = $scope.tenantName;
         $scope.emailId = $scope.tenantEmailId;
	  }
  }

  

  $scope.ok = function () {	
	
	   var receipt = new Receipts({
                    date: new Date(),
					type: $scope.receipt.type,					
					flatnumber: $scope.item.flatnumber,
                    period: $scope.receipt.period,
                    eventDate: $scope.receipt.eventDate,
					tenantFromDate: $scope.receipt.tenantFromDate,
					tenantToDate: $scope.receipt.tenantToDate,
					mode: $scope.receipt.mode,
					checkNumber: $scope.receipt.checkNumber,
					checkDate: $scope.receipt.checkDate,
					bank: $scope.receipt.bank,
                    acctNumber: $scope.receipt.acctNumber,
					notes: $scope.receipt.notes,
					amount: $scope.receipt.amount,	
					status: '0',
					partyName : $scope.receipt.partyName,
				    email: $scope.emailId
             });


	   receipt.$save(function (data) {
						$modalInstance.close(data);
					}, function ($http) {
						console.log('Couldn\'t save receipt data.');
						$modalInstance.close();
	   });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

}]);


angular.module('magnoliaApp')
.controller('ReceiptConfirmationCtrl',['$scope','$modalInstance','item','$timeout','$filter',function($scope, $modalInstance,item,$timeout,$filter) {

  $scope.item = item.item;
  $scope.receipt = item.receipt;

  var receiptDesc = '';

  $scope.onPrint = function() {
       var w=window.print();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
 

}]);


angular.module('magnoliaApp')
.controller('ReceiptsCtrl',['$scope','Receipts','$timeout',function($scope,Receipts,$timeout) {


	  $scope.filteredReceipts = [];
	  $scope.currentPage = 1; 
      $scope.entryLimit = 10; 

	  $scope.refreshGrid = function(page) {
		    var begin = ((page - 1) * $scope.entryLimit);
		    Receipts.query({offset: begin, limit: $scope.entryLimit},function(data, headers) {
				  $scope.currentPage = page; 
				  $scope.receipts = data;
				  $scope.filteredReceipts = data;;
				  $scope.totalItems =  headers('record-count');
			});
	  }	  

	  $scope.refreshGrid($scope.currentPage);
	  
	  $scope.removeReceipt = function (index,receipt) {
			Receipts.remove({id: receipt._id}, function() {
				$scope.refreshGrid($scope.currentPage);
		  });
	  };


	  $scope.filterResult = function() {
			console.log($scope.filterCriteria);
	  }



}]);

angular.module('magnoliaApp')
.controller('PaymentsCtrl',['$scope','Payments',function($scope,Payments) {


	  $scope.filteredReceipts = [];
	  $scope.currentPage = 1; 
      $scope.entryLimit = 10; 

	  $scope.refreshGrid = function(page) {
		    var begin = ((page - 1) * $scope.entryLimit);
		    Payments.query({offset: begin, limit: $scope.entryLimit},function(data, headers) {
				  $scope.currentPage = page; 
				  $scope.receipts = data;
				  $scope.filteredPayments = data;;
				  $scope.totalItems =  headers('record-count');
			});
	  }	  

	  $scope.refreshGrid($scope.currentPage);
	  
	  $scope.removePayment = function (index,payment) {
			Payments.remove({id: payment._id}, function() {
				$scope.refreshGrid($scope.currentPage);
		  });
	  };


	  $scope.filterResult = function() {
			console.log($scope.filterCriteria);
	  };



}]);


angular.module('magnoliaApp')
.controller('ModalNewPaymentCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	$scope.open = function (item,index) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'newPaymentModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'ModalInstanceNewPaymentCtrl',
		  windowClass : 'modal-huge',
		  resolve: {
			item: function () {
			  return item;
			}
		  }
		});

		modalInstance.result.then(function (payment) {				
			    $scope.refreshGrid($scope.currentPage);
				}, function () {
				console.log("canceled");
		});

	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceNewPaymentCtrl',['$scope','$modalInstance','Payments','Vendors','Members','AlertService',function($scope,$modalInstance,Payments,Vendors,Members,AlertService) {

  $scope.item = {};

  $scope.paymentTypes =  ['Vendor Payment','Staff Salary','Office Expenses'];

  $scope.today = function() {
    $scope.item.checkDate = new Date();
	$scope.item.date = new Date();
  };

  $scope.today();
  
  $scope.vendors= Vendors.query();

  $scope.members= Members.query();

  $scope.ok = function () {	
	    var params = {id: $scope.item._id};
		var payment = new Payments({
			    paymentType : $scope.item.paymentType,
				vendorName : $scope.item.vendorName,
				invoiceNumber : $scope.invoiceNumber,
				desciption : $scope.item.description,
				date: $scope.item.date,
				amount: $scope.item.paymentAmount,
				mode: $scope.item.mode,
				checkNumber: $scope.item.checkNumber,
				status: '2',
				authorizedBy: $scope.item.authorizedBy
			});

			payment.$save(function (data) {
				AlertService.clear();
				AlertService.success('Payment data updated');
				$modalInstance.close(data);
			 }, function ($http) {
						console.log('Couldn\'t save payment data.');
						$modalInstance.close();
			});

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


}]);



angular.module('magnoliaApp')
.controller('ModalPaymentReconcileCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	$scope.open = function (index,item) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'paymentReconcileModal',
		  windowClass : 'modal-huge',
          backdrop: 'static',
		  scope : $scope,
		  controller: 'ModalInstancePaymentReconcileCtrl',		
		  resolve: {
			item: function () {
			  return {"item" : item};
			}
		  }
		});

		modalInstance.result.then(function () {
			console.log('Ok from model Instance');	
		}, function () {
			console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstancePaymentReconcileCtrl',['$scope','$modalInstance','item','$filter','Payments',function($scope, $modalInstance, item,$filter,Payments) {

	  $scope.confirm = function () {	

		$scope.item.status = '1';
		var params = {id: $scope.item._id};
		$scope.item.$update(params,function() {
			AlertService.clear();
			AlertService.success('Payment confirmed');
		});
		$modalInstance.close();

	  };

	  $scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	  };

}]);






angular.module('magnoliaApp')
.controller('VendorCtrl',['$scope','Vendors','AMC',function($scope,Vendors,AMC) {

	  $scope.filteredVendors = [];
	  $scope.currentPage = 1; 
      $scope.entryLimit = 10; 

	  $scope.refreshGrid = function(page) {
		    var begin = ((page - 1) * $scope.entryLimit);
		    Vendors.query({offset: begin, limit: $scope.entryLimit},function(data, headers) {
				  $scope.currentPage = page; 
				  $scope.vendors = data;
				  $scope.filteredVendors = data;;
				  $scope.totalItems =  headers('record-count');
			});
	  }	  

	  $scope.refreshGrid($scope.currentPage);
	  
	  $scope.removeVendor = function (index,vendor) {
			Vendors.remove({id: vendor._id}, function() {
				$scope.refreshGrid($scope.currentPage);
		  });
	  };


	  $scope.filteredAmc = [];
	  $scope.amcCurrentPage = 1; 

	  $scope.refreshAmcGrid = function(page) {
		    var begin = ((page - 1) * $scope.entryLimit);
		    AMC.query({offset: begin, limit: $scope.entryLimit},function(data, headers) {
				  $scope.amcCurrentPage = page; 
				  $scope.amc = data;
				  $scope.filteredAmc = data;;
				  $scope.totalAmcItems =  headers('record-count');
			});
	  }	  

	  $scope.refreshAmcGrid($scope.amcCurrentPage);

	  var today = new Date();

	  $scope.isActive = function (amc) {
		  var amcEndDate = new Date(amc.endDate);
		  if ( amcEndDate > today) {
			 return true;
		  } else {
			 return false;
		  }		  
	  };
	  
	  $scope.removeAmc = function (index,amc) {
			AMC.remove({id: amc._id}, function() {
				$scope.refreshAmcGrid($scope.amcCurrentPage);
		  });
	  };


}]);


angular.module('magnoliaApp')
.controller('ModalVendorCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	$scope.open = function (item,index) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'vendorModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'ModalInstanceVendorCtrl',
		  windowClass : 'modal-huge',
		  resolve: {
			item: function () {
			  return item;
			}
		  }
		});

		modalInstance.result.then(function (selectedItem) {}, function () {
				console.log("vendor updated");
				}, function () {
				console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceVendorCtrl',['$scope','$modalInstance','Vendors','AlertService',function($scope,$modalInstance,Vendors,AlertService) {

  $scope.contact = {};

  $scope.ok = function () {	

	    var params = {id: $scope.item._id};
		$scope.item.$update(params,function() {
			AlertService.clear();
			AlertService.success('Information for vendor is updated');
		});
		$modalInstance.close();

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.addContact = function() {
        $scope.item.contacts.push({
            contactName: $scope.contact.name,
		    contactDesignation: $scope.contact.designation,
            contactPhone: $scope.contact.phone,
            contactEmail: $scope.contact.email
        });

        $scope.contact.name = '';
        $scope.contact.designation = '';
		$scope.contact.phone = '';
		$scope.contact.email = '';
  }

   $scope.deleteContact = function (contact) {
        var index = $scope.item.contacts.indexOf(contact);
        if (index != -1) {
          $scope.item.contacts.splice(index, 1);
        }
   }


   $scope.isInvalid = function () {
	   return (!$scope.contact.name || 0 === $scope.contact.name.length);
   }

}]);


angular.module('magnoliaApp')
.controller('NewVendorModalCtrl',['$scope','$modal','$log','Vendors',function($scope,$modal,$log,Vendors) {

	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'newVendorModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'NewVendorModalInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (vendor) {
			    $scope.refreshGrid($scope.currentPage);
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('NewVendorModalInstanceCtrl',['$scope','$modalInstance','Vendors',function($scope,$modalInstance,Vendors) {

  
  $scope.item = {};
  $scope.contact = {};

  $scope.areas =  ['House Keeping','Electrical Maintenance','Security','STP','WTP','Gardening','Raw Material','Cooking Gas','Legal','Accounting','Utility Provider'];


  if (!$scope.item.contacts) {
	  $scope.item.contacts = new Array();
  }

  $scope.ok = function () {	

	  var vendors = Vendors.query(function () {
					$scope.vendors = vendors;
				}, function ($http) {
					console.log('Couldn\'t read vendor data.');
				});

	  var vendor = new Vendors({
						vendorName : $scope.item.vendorName,
						area : $scope.item.area,
						contactNumber: $scope.item.contactNumber,
						tin: $scope.item.tin,
						pan: $scope.item.pan,
						address: $scope.item.address,
						referencedByName : $scope.item.referencedbyName,
						referencedbyContatNumber : $scope.item.referencedbyContatNumber,
						active:"1",
						contacts: $scope.item.contacts
				 });

	  vendor.$save(function (data) {
						$modalInstance.close(data);
					}, function ($http) {
						console.log('Couldn\'t save vendor data.');
						$modalInstance.close();
					});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.addContact = function() {
        $scope.item.contacts.push({
            contactName: $scope.contact.name,
		    contactDesignation: $scope.contact.designation,
            contactPhone: $scope.contact.phone,
            contactEmail: $scope.contact.email
        });

        $scope.contact.name = '';
        $scope.contact.designation = '';
		$scope.contact.phone = '';
		$scope.contact.email = '';
  }

   $scope.deleteContact = function (contact) {
        var index = $scope.item.contacts.indexOf(contact);
        if (index != -1) {
          $scope.item.contacts.splice(index, 1);
        }
   }


   $scope.isInvalid = function () {
	   return (!$scope.contact.name || 0 === $scope.contact.name.length);
   }

}]);


angular.module('magnoliaApp')
.controller('DocumentsCtrl',['$scope','$modal','$log','$window','Documents',function($scope,$modal,$log,$window,Documents) {

	  $scope.filteredReceipts = [];
	  $scope.currentPage = 1; 
      $scope.entryLimit = 10; 

	  $scope.refreshGrid = function(page) {
		    var begin = ((page - 1) * $scope.entryLimit);
		    Documents.query({offset: begin, limit: $scope.entryLimit},function(data, headers) {
				  $scope.currentPage = page; 
				  $scope.items = data;
				  $scope.totalItems =  headers('record-count');
			});
	  }	  

	  $scope.refreshGrid($scope.currentPage);
	  
 	  $scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'documentUploadModal',
		  controller: 'DocumentUploadModalInstanceCtrl',
          backdrop: 'static',
		  resolve: {
			items: function () {
			  return $scope;
			}
		  }
		 });


		  modalInstance.result.then(function (selectedItem) {
				 Documents.query(function(response) {
					  $scope.items = response;	  
				 });				
			}, function () {
				console.log("canceled");
		  });
	  };

	  $scope.getDoc = function(item) {
		   $window.open("/api/documents/" + item._id);	
	  }

	  $scope.removeDocument = function (doc) {
			Documents.remove({id: doc._id}, function() {
				$scope.refreshGrid($scope.currentPage);
		  });
	  };

}]);



angular.module('magnoliaApp')
.controller('DocumentUploadModalInstanceCtrl',['$scope','$modalInstance','FileUploader','AlertService',function($scope,$modalInstance,FileUploader,AlertService) {

	 $scope.item = {};

	  var uploader = $scope.uploader = new FileUploader({
				scope: $scope,        
				url: '/api/upload',
				formData: [
					{ documentName: $scope.item.documentName,
					  documentDescription: $scope.item.documentDescription,
					  accessLevel: $scope.item.accessLevel,
					  flatnumber : '*'
					}
				]
	  });


	  uploader.onAfterAddingFile = function(fileItem) {
			 $scope.item.documentName = fileItem.file.name;
	  };

	  uploader.onSuccessItem = function(fileItem, response, status, headers) {
			AlertService.clear();
			AlertService.success('Document ' + uploader.queue[0].file.name + ' is uploaded to server');
			$modalInstance.close($scope.messageText);
	  };

	  uploader.onBeforeUploadItem = function(item) {
			item.formData[0].documentName = $scope.item.documentName;
			item.formData[0].documentDescription = $scope.item.documentDescription;
			item.formData[0].accessLevel = $scope.item.accessLevel;
	  };

	  $scope.cancel = function () {
			$modalInstance.dismiss('cancel');
	  };

}]);

angular.module('magnoliaApp')
.controller('UserDetailCtrl',['$scope','Apartments',function($scope,Apartments) {
	
	$scope.item =  Apartments.get({id:$scope.user.apartmentnumber});
	$scope.apartmentdataTitle = 'Apartment\'s Details';
	$scope.ownerdataTitle = 'Owner\'s Details';
	$scope.tenantdataTitle = 'Tenant\'s Details';

}]);

angular.module('magnoliaApp')
.controller('UserPaymentCtrl',['$scope','Apartments',function($scope,Apartments) {	
	Apartments.get({id:$scope.user.apartmentnumber}, function(apartment) {
		    $scope.item = apartment;
			var diff = $scope.item.maintenanceDetails.maintenanceDueTotal-
						$scope.item.maintenanceDetails.maintenancePaidTotal;
			if (diff > 0){
					$scope.isDefaulter ="red";
			} else {
				$scope.isDefaulter ="green";
			}
	});

}]);


angular.module('magnoliaApp')
.controller('ModalNewPeriodCtrl',['$scope','$modal','$log','Apartments',function($scope,$modal,$log,Apartments) {

	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'newPeriodModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'NewPeriodInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (periodData) {
			    console.log("Adding new period");
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('NewPeriodInstanceCtrl',['$scope','$filter','$http','$modalInstance','Apartments','AlertService', function($scope,$filter,$http,$modalInstance,Apartments,AlertService) {

  
  $scope.item = {
	  period : {
		  rate : 2.5}  
  };

  $scope.item.period.rate = 2.5;

  $scope.dateOptions = {
    dateFormat: 'mm-yy',
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
  };

  var getPeridoDuration = function() {
		var year1 = $scope.item.period.start.getFullYear();
		var year2 = $scope.item.period.end.getFullYear();
		var month1 = $scope.item.period.start.getMonth();
		var month2 = $scope.item.period.end.getMonth();
		if(month1===0){ 
		  month1++;
		  month2++;
		}
		var periodLength = (year2-year1)*12+(month2-(month1-1)); 	
		return periodLength;
  }

  $scope.getPeriod = getPeridoDuration;

   $scope.$watch('item.period.start', function() {
       if ($scope.item.period.start)  {
		   $scope.item.period.end = new Date($scope.item.period.start);
		   $scope.item.period.end.setMonth($scope.item.period.end.getMonth() + 5); 
       }
   });

  
  $scope.ok = function () {	
    	var periodLength = getPeridoDuration(); 
		var format = 'MMM-yyyy';
		var maintenancePeriodStr = $filter("date")($scope.item.period.start, format) + " - " + $filter("date")($scope.item.period.end, format);
		var lastPaymentDate = new Date();
		lastPaymentDate.setTime($scope.item.period.start.getTime() + (45*24*60*60*1000)); 
		var lastPaymentDateStr = $filter("date")(lastPaymentDate, 'MMMM d, y');
		console.log(maintenancePeriodStr + 'last Payment Date' + lastPaymentDateStr);
		
		var newMaintenancePeriod =      {					
			period : maintenancePeriodStr,
			maintenanceRate : $scope.item.period.rate,
			periodLength : periodLength,
			lastPaymentDate : lastPaymentDateStr
		}

		var request = $http({
			method: "post",
			url: "/api/newperiod",
			data: newMaintenancePeriod
		});


        request.success(function(data) {
			AlertService.clear();
			AlertService.success('Maintenance Period ' + maintenancePeriodStr + ' added.' );
        });

		$modalInstance.dismiss('ok');




  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };



}]);

angular.module('magnoliaApp')
.controller('MembersCtrl',['$scope','$http','Members',function($scope,$http,Members) {

      
	  $scope.refreshGrid = function() {

           var request = $http({
	            method: "get",
	            url: "/api/functionalareas"
           });

           request.success(function(areas) {
                $scope.assignedfunctionAreas = []; 
                areas.forEach(function (area) {
                    var assignedfunctionArea = {
                        name: area.name,
                        primaryOwner : null,
                        secondaryOwner : null
                    }
                    $scope.assignedfunctionAreas.push(assignedfunctionArea);
                });

		        Members.query(function(data, headers) {
				      $scope.members = data;
                      data.forEach(function (member) {
                          if (member.functionAreas) {
                             member.functionAreas.forEach(function (functionArea) {
                                $scope.assignedfunctionAreas.forEach(function (assignedfunctionArea) {
                                    if(assignedfunctionArea.name == functionArea.name) {
                                        if (functionArea.ownership) {
                                            assignedfunctionArea.secondaryOwner = member;
                                        } else {
                                            assignedfunctionArea.primaryOwner = member;
                                        }                                    
                                    }                      
                                });
                      
                            });
                          }
                      });
				      $scope.totalItems =  headers('record-count');
			    });


           });



	  }	  

	  $scope.refreshGrid($scope.currentPage);
	  
	  $scope.removeMember = function (index,member) {
			Members.remove({id: member._id}, function() {
				$scope.refreshGrid();
		  });
	  };

}]);

angular.module('magnoliaApp')
.controller('NewMemberModalCtrl',['$scope','$modal','$log','Members',function($scope,$modal,$log,Members) {

	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'newMemberModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'NewMemberModalInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (member) {
			    $scope.members.push(member);
				}, function () {
				console.log("canceled");
		});
  };

}]);

angular.module('magnoliaApp')
.controller('NewMemberModalInstanceCtrl',['$scope','$modalInstance','Members','$http',function($scope,$modalInstance,Members,$http) {

  
  //availableFunctionalAreas = available for a member to use
  //assignedfunctionArea = already assigned functional areas

  $scope.item = {}; 
  $scope.hasCoOwner = false;
  
  var request = $http({
	    method: "get",
	    url: "/api/apartmentnumbers"
  });

  request.success(function(data) {
	    $scope.apartmentnumbers = data;
  });

  $scope.change = function() {
      var ownerDataRequest = $http({
	        method: "get",            
	        url: "/api/apartments/owner/" + $scope.item.flatNo
      });

      ownerDataRequest.success(function(owner) {
	        $scope.item.memberName = owner.name;
            if (owner.emails) {
                $scope.item.emailId =  owner.emails[0];
            }
            if (owner.phones) {
                $scope.item.contactNumber = owner.phones[0];
            }
            if (owner.coowner && owner.coowner.name) {
                $scope.hasCoOwner = true;
            }
     });

  }

  $scope.functionArea = {};
  $scope.functionArea.name = '';
  $scope.functionArea.ownership = 0;

  if (!$scope.item.functionAreas) {
	  $scope.item.functionAreas = new Array();
  } 

  $scope.availableFunctionalAreas = [];
                      
  $scope.assignedfunctionAreas.forEach(function (asignedArea) {
          if (!asignedArea.primaryOwner || !asignedArea.secondaryOwner) {
              $scope.availableFunctionalAreas.push(asignedArea);
          }
  });

  var getPositionInArrayByName = function(arrayToCheck,name) {
      for (var i=0; i < arrayToCheck.length ; i++ ) {
            console.log(arrayToCheck[i].name);
            if(arrayToCheck[i].name == name) {
                return i;
            }            
      }
      return -1;      
  }

  $scope.item.functionAreas.forEach(function (functionArea) {  
       var index = getPositionInArrayByName($scope.availableFunctionalAreas,functionArea.name.name);
       if (index != -1) {
          $scope.availableFunctionalAreas.splice(index, 1);
       }
  });

  $scope.addFunctionalArea = function() {
        $scope.item.functionAreas.push({
            name: $scope.functionArea.name.name,
            ownership: $scope.functionArea.ownership
        });
        console.log($scope.functionArea.name.name);
        var index = getPositionInArrayByName($scope.availableFunctionalAreas,$scope.functionArea.name.name);
        console.log(index);
        if (index != -1) {
          $scope.availableFunctionalAreas.splice(index, 1);
        }
        $scope.functionArea.name = '';
        $scope.functionArea.ownership = 0;

  }

  $scope.deleteFunctionalArea = function (area) {
        var index = getPositionInArrayByName($scope.assignedfunctionAreas,area.name);
        var assignedArea = $scope.assignedfunctionAreas[index];
        if (area.ownership == 0) {
            assignedArea.primaryOwner = null;
        } 

        if (area.ownership == 1) {
             assignedArea.secondaryOwner = null;
        } 
        
        var index = $scope.item.functionAreas.indexOf(area);
        if (index != -1) {
          $scope.item.functionAreas.splice(index, 1);
        }

   }


  $scope.ok = function () {	

	  var member = new Members({
                        flatNo : $scope.item.flatNo,
                        coowner: $scope.item.isCoonwer,
						functionAreas : $scope.item.functionAreas,
						active:"1"
				 });

	  member.$save(function (data) {
						$modalInstance.close(data);
					}, function () {
						console.log('Couldn\'t save member data.');
						$modalInstance.close();
					});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.isInvalid = function () {
	   return (!$scope.member.name || 0 === $scope.member.name.length);
  }

}]);



angular.module('magnoliaApp')
.controller('DashboardCtrl',['$scope','$http','$modal',function($scope,$http,$modal) {

		$scope.aptSummary = {};

		$scope.emailRecepients = ['All Flat Owners','All Residents','All Tenants'];
 
		var request = $http({
			method: "post",
			url: "/api/aptsummary"
		});


        request.success(function(data) {
			$scope.aptSummary = data;
        });


		$scope.open = function (periodName) {
			$scope.period = periodName;
			
			if (periodName == 'all') {
				$scope.currentPeriodData = {
					    periodTotalDue : $scope.aptSummary.totalMaintenaceReceivable,
					    periodTotalPaid : $scope.aptSummary.totalMaintenacePaid,
						periodNoOfDefaulters : $scope.aptSummary.totalDefaulters,
						periodPrctReceived : $scope.aptSummary.percentageReceived
				}
			} else {
				var periodsData = $scope.aptSummary.periodData;
				periodsData.forEach(function(periodInfo) {
					if(periodInfo.periodName == periodName) {
						$scope.currentPeriodData = periodInfo;
					}
				});
			}

			var modalInstance = $modal.open({
			  templateUrl: 'periodSummaryModal',
			  size : 'sm',
			  scope : $scope,
			  controller: 'ModalInstancePeriodDetailsCtrl',		
              backdrop: 'static',
			  resolve: {
				item: function () {
				  return {"periodName" : periodName};
				}
			  }
			});

			modalInstance.result.then(function () {
				console.log('Ok from model Instance');	
			}, function () {
				console.log("canceled");
			});
		};

}]);


angular.module('magnoliaApp')
.controller('ModalInstancePeriodDetailsCtrl',['$scope','$filter','$http','$modalInstance','Apartments',function($scope,$filter,$http,$modalInstance,Apartments) {


	$scope.disableDownload = true;
	$scope.getHeader = function () {return ["Apt_No","Owner_Name","Email1","Email2","Contact_Number1","Contact_number2","Current_Dues"]};

	var request = $http({
		method: "get",
		url: "/api/apartments/defaulters/" + $scope.period
	});

   request.success(function(data) {
		$scope.arrayData = data;
		$scope.disableDownload = false;
   });


  $scope.ok = function (periodName) {	
	    $modalInstance.dismiss('ok');
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

}]);



angular.module('magnoliaApp')
.controller('ModalEmailCtrl',['$scope','$modal','$log','Apartments',function($scope,$modal,$log,Apartments) {

	$scope.mail = {};
    $scope.mailToAll = true;
	$scope.flatnumber = null;
 	$scope.open = function (apt) {
		if (apt) {
			Apartments.get({id:apt.flatnumber},function(apartment) {
				var ownerEmail = apartment.owner.emails[0];
				$scope.mailToAll = false;
				$scope.flatnumber = apt.flatnumber;
				$scope.emailRecepients = [];
				$scope.emailRecepients.push('Owner');
				if (apartment.status == 2) {
					if (apartment.tenant && apartment.tenant.emails && apartment.tenant.emails[0]) {
						var tenantEmail = apartment.tenant.emails[0];
						$scope.emailRecepients.push('Tenant');
						$scope.emailRecepients.push('Both - Owner & Tenant');
					}					
				}					
			});
		}
		var modalInstance = $modal.open({
		  templateUrl: 'newEmailModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'NewEmailInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (periodData) {
			    console.log(periodData);
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('NewEmailInstanceCtrl',['$scope','$filter','$http','$modalInstance','AlertService', function($scope,$filter,$http,$modalInstance,AlertService) {
 
  $scope.ok = function () {	

		var mailObject =      {			
			mailToAll: $scope.mailToAll,
			emailTo : $scope.mail.emailTo,
			emailSubject : $scope.mail.emailSubject,
			emailcontent : $scope.mail.emailcontent,
			flatnumber: $scope.flatnumber
		}

		var request = $http({
			method: "post",
			url: "/api/sendMail",
			data: mailObject
		});


        request.success(function(data) {
			AlertService.clear();
			AlertService.success('Email sent to all members.' );
        });

		$modalInstance.dismiss('ok');

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };



}]);



angular.module('magnoliaApp')
.controller('ModalMaintenanceReminderCtrl',['$scope','$modal','$log','Apartments',function($scope,$modal,$log,Apartments) {

 	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'maintenanceReminderModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'MaintenanceReminderInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (periodData) {
			    console.log("Sending payment reminder");
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('MaintenanceReminderInstanceCtrl',['$scope','$filter','$http','$modalInstance','Apartments','AlertService', function($scope,$filter,$http,$modalInstance,Apartments,AlertService) {

   $scope.item = {};
 
   $scope.ok = function () {	

		var request = $http({
			method: "post",
			url: "/api/sendpaymentreminder"
		});


        request.success(function(data) {
			AlertService.clear();
			AlertService.success('Email reminder sent to all members.' );
        });

		$modalInstance.dismiss('ok');

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);


angular.module('magnoliaApp')
.controller('ModalPaymentSummaryCtrl',['$scope','$modal','$log','Apartments',function($scope,$modal,$log,Apartments) {

 	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'maintenanceSummaryModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'PaymentSummaryInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (periodData) {
			    console.log("send payment summary");
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('PaymentSummaryInstanceCtrl',['$scope','$filter','$http','$modalInstance','Apartments','AlertService', function($scope,$filter,$http,$modalInstance,Apartments,AlertService) {

   $scope.item = {};
 
   $scope.ok = function () {	


 
		var request = $http({
			method: "post",
			url: "/api/paymentsummary"
		});


        request.success(function(data) {
			AlertService.clear();
			AlertService.success('Maintenance summary statement send to all members.' );
        });

		$modalInstance.dismiss('ok');

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);


angular.module('magnoliaApp')
.controller('ModalMemberCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {


	$scope.open = function (item,index) {
		var modalInstance = $modal.open({
		  templateUrl: 'memberModal',
          scope : $scope,
		  backdrop: 'static',
		  controller: 'ModalInstanceMemberCtrl',
		  windowClass : 'modal-huge',
		  resolve: {
			item: function () {
			  return item;
			}
		  }
		});

		modalInstance.result.then(function (selectedItem) {}, function () {
				console.log("member data updated");
				}, function () {
				console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceMemberCtrl',['$scope','$modalInstance','Members','AlertService',function($scope,$modalInstance,Members,AlertService) {

  var functionalAreasClone = [];
  $scope.item.functionAreas.forEach(function (asignedArea) {
        functionalAreasClone.push(asignedArea);
  });

  $scope.functionArea = {};
  $scope.functionArea.name = '';
  $scope.functionArea.ownership = 0;

  if (!$scope.item.functionAreas) {
	  $scope.item.functionAreas = new Array();
  } 

  $scope.availableFunctionalAreas = [];
                      
  $scope.assignedfunctionAreas.forEach(function (asignedArea) {
          if (!asignedArea.primaryOwner || !asignedArea.secondaryOwner) {
              $scope.availableFunctionalAreas.push(asignedArea);
          }
  });

  var getPositionInArrayByName = function(arrayToCheck,name) {
      for (var i=0; i < arrayToCheck.length ; i++ ) {
            if(arrayToCheck[i].name == name) {
                return i;
            }            
      }
      return -1;      
  }

  $scope.item.functionAreas.forEach(function (functionArea) {  
       var index = getPositionInArrayByName($scope.availableFunctionalAreas,functionArea.name.name);
       if (index != -1) {
          $scope.availableFunctionalAreas.splice(index, 1);
       }
  });

  $scope.addFunctionalArea = function() {
        $scope.item.functionAreas.push({
            name: $scope.functionArea.name.name,
            ownership: $scope.functionArea.ownership
        });
        var index = getPositionInArrayByName($scope.availableFunctionalAreas,$scope.functionArea.name.name);
        if (index != -1) {
          $scope.availableFunctionalAreas.splice(index, 1);
        }
        $scope.functionArea.name = '';
        $scope.functionArea.ownership = 0;

  }

  $scope.deleteFunctionalArea = function (area) {
        var index = getPositionInArrayByName($scope.assignedfunctionAreas,area.name);
        var assignedArea = $scope.assignedfunctionAreas[index];
        if (area.ownership == 0) {
            assignedArea.primaryOwner = null;
        } 

        if (area.ownership == 1) {
             assignedArea.secondaryOwner = null;
        } 
        
        var index = $scope.item.functionAreas.indexOf(area);
        if (index != -1) {
          $scope.item.functionAreas.splice(index, 1);
        }

   }


  $scope.ok = function () {	

	    var params = {id: $scope.item._id};
		$scope.item.$update(params,function() {
			AlertService.clear();
			AlertService.success('Information for member is updated');
		});
		$modalInstance.close();

  };

  $scope.cancel = function () {
    $scope.item.functionAreas = functionalAreasClone;
    $modalInstance.dismiss('cancel');
  };


  $scope.isInvalid = function () {
	   return (!$scope.contact.name || 0 === $scope.contact.name.length);
  }

}]);

angular.module('magnoliaApp')
.controller('ModalMemberByFunctionCtrl',['$scope','$modal','$log',function($scope,$modal,$log) {

 	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'memberbyFunctionModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'memberByFunctionInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});


		modalInstance.result.then(function () {
			    console.log("done!");
				}, function () {
				console.log("canceled");
		});
        
  };
}]);

angular.module('magnoliaApp')
.controller('memberByFunctionInstanceCtrl',['$scope','$filter','$http','$modalInstance',function($scope,$filter,$http,$modalInstance) {

   $scope.ok = function () {	
		$modalInstance.dismiss('ok');
   };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

}]);

angular.module('magnoliaApp')
.controller('NewReceiptConfirmationCtrl',['$scope','$modalInstance','item','$timeout','$filter',function($scope, $modalInstance,item,$timeout,$filter) {

  $scope.item = item.item;
  $scope.receipt = item.receipt;

  var receiptDesc = '';

  $scope.onPrint = function() {
       var w=window.print();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
 

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceNewReceiptCtrl',['$scope','$modalInstance','item', '$http','$filter','Apartments','Receipts',function($scope, $modalInstance, item,$http, $filter,Apartments,Receipts) {

  $scope.banks =  ['ICICI Bank','IDBI Bank','SBI Bank','Punjab National Bank','HDFC Bank','Saraswat Bank','Kotak Mahindra Bank','Yes Bank','Allahabad Bank',
	'Andhra Bank','Bank of Baroda','Bank of India', 'Bank of Maharastra','Bhartiya Mahila Bank','Canara Bank','Central Bank of India','Corporation Bank',
	'Dena Bank','Indian Bank','Indian Overseas Bank','Oriental Bank of Commerce','Punjab and Sind Bank','Syndicate Bank','UCO Bank','Union Bank of India',
	'United Bank of India','Vijaya Bank','State Bank of India','State Bank of Bikaner & Jaipur','State Bank of Hyderabad','State Bank of Mysore','State Bank of Patiala',
	'State Bank of Travancore','IndusInd Bank','ING Vysya Bank','Karnataka Bank','Karur Vysya Bank','Lakshmi Vilas Bank','Nainital Bank','Tamilnadu Mercantile Bank',
	'Dhanlaxmi Bank','Federal Bank','City Union Bank','Development Credit Bank','BNP Paribas','HSBC','Citibank N.A.'];

  var request = $http({
	    method: "get",
	    url: "/api/apartmentnumbers"
  });

  request.success(function(data) {
	    $scope.apartmentnumbers = data;
  });
  
  if (!!item.receipt) {

	$scope.receipt = item.receipt;	

	Apartments.get({id:item.receipt.flatnumber},function(apartment) {
		$scope.item = apartment;		
	});
	
	$scope.readonly = true;
  }else {
	
	$scope.receipt = {};
	$scope.readonly = false;
	$scope.receipt.receiptMode = "Check";
	$scope.receipt.residentStatus = '1';
  }

  $scope.changeCategory = function () {	
	  $scope.receipt.partyName = '';
	  $scope.emailId = '';
  }

  $scope.changeApartment = function (flatnumber) {	
		Apartments.get({id:flatnumber},function(apartment) {
			$scope.periods = [];
			var periodData = apartment.maintenanceDetails.paymentSummary;
			for (var i = periodData.length - 1; i > -1  ; i--)	{
				var periodDetails = periodData[i];
				$scope.periods.push(periodDetails.period);
			}
			
			$scope.receipt.flatStatus = apartment.status;

			$scope.ownerName = apartment.owner.name;
			$scope.ownerEmailId = apartment.owner.emails[0];

		    $scope.receipt.partyName = $scope.ownerName;
            $scope.emailId = $scope.ownerEmailId;

			if(apartment.status == 2) {
				$scope.tenantName = apartment.tenant.name;
				$scope.tenantEmailId = apartment.tenant.emails[0];
			}
			
		});	
   } 

  $scope.changeResidentStatus = function () {	
	  if ($scope.receipt.residentStatus == '1')  {
		 $scope.receipt.partyName = $scope.ownerName;
         $scope.emailId = $scope.ownerEmailId;
	  } else {
		 $scope.receipt.partyName = $scope.tenantName;
         $scope.emailId = $scope.tenantEmailId;
	  }
  }

  

  $scope.ok = function () {	
	
	   var receipt = new Receipts({
                    date: new Date(),
					type: $scope.receipt.type,					
					flatnumber: $scope.receipt.flatnumber,
                    period: $scope.receipt.period,
                    eventDate: $scope.receipt.eventDate,
					tenantFromDate: $scope.receipt.tenantFromDate,
					tenantToDate: $scope.receipt.tenantToDate,
					mode: $scope.receipt.mode,
					checkNumber: $scope.receipt.checkNumber,
					checkDate: $scope.receipt.checkDate,
					bank: $scope.receipt.bank,
                    acctNumber: $scope.receipt.acctNumber,
					notes: $scope.receipt.notes,
					amount: $scope.receipt.amount,	
					status: '0',
					partyName : $scope.receipt.partyName,
				    email: $scope.emailId
             });


	   receipt.$save(function (data) {
						$modalInstance.close(data);
					}, function ($http) {
						console.log('Couldn\'t save receipt data.');
						$modalInstance.close();
	   });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

}]);


angular.module('magnoliaApp')
.controller('ModalNewReceiptCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	var openConfirmationDialog = function (receipt) {
		$scope.receipt = receipt;
		var modalInstance = $modal.open({
		  templateUrl: 'newReceiptConfirmationModal',
		  windowClass : 'modal-huge',
          backdrop: 'static',
		  scope : $scope,
		  controller: 'NewReceiptConfirmationCtrl',		
		  resolve: {
			item: function () {
			  return {"receipt" : receipt};
			}
		  }
		});

		modalInstance.result.then(function (selectedItem) {
			console.log("saved");
		}, function () {
			console.log("canceled");
		});
	};

	$scope.open = function (receipt) {
		var modalInstance = $modal.open({
		  templateUrl: 'newReceiptModal',
		  windowClass : 'modal-huge',
          backdrop: 'static',
		  scope : $scope,
		  controller: 'ModalInstanceNewReceiptCtrl',		
		  resolve: {
			item: function () {
			  return {"receipt" : receipt};
			}
		  }
		});

		modalInstance.result.then(function (data) {
			$scope.receipt = data;
			$scope.refreshGrid($scope.currentPage);
			openConfirmationDialog($scope.receipt);
			
		}, function () {
			console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('NewAMCModalCtrl',['$scope','$modal','$log','Vendors',function($scope,$modal,$log,Vendors) {

	$scope.open = function () {
		var modalInstance = $modal.open({
		  templateUrl: 'newAMCModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'NewAMCModalInstanceCtrl',
		  resolve: {
				items: function () {
				  return $scope;
				}
			  }
		});

		modalInstance.result.then(function (amc) {
			    $scope.refreshAmcGrid($scope.amcCurrentPage);
				}, function () {
				console.log("canceled");
		});
  };
}]);

angular.module('magnoliaApp')
.controller('NewAMCModalInstanceCtrl',['$scope','$modalInstance','$filter','Vendors','FileUploader',function($scope,$modalInstance,$filter,Vendors,FileUploader) {

  
  $scope.item = {};
  $scope.areas =  ['House Keeping','Electrical Maintenance','Security','STP','WTP','Gardening','Raw Material','Cooking Gas','Legal','Accounting','Utility Provider'];

  $scope.getPeridoDuration = function() {
		var year1 = $scope.item.amcStartDate.getFullYear();
		var year2 = $scope.item.amcEndDate.getFullYear();
		var month1 = $scope.item.amcStartDate.getMonth();
		var month2 = $scope.item.amcEndDate.getMonth();
		if(month1===0){ 
		  month1++;
		  month2++;
		}
		var periodLength = (year2-year1)*12+(month2-(month1-1)); 	
		return periodLength;
  }

  $scope.contractDocs = [];

  var uploader = $scope.uploader = new FileUploader({
            scope: $scope,        
            url: '/api/amc',
			removeAfterUpload: true,
            formData: [
                { 
				  vendorName : $scope.item.vendorName,
				  startDate : new Date($scope.item.amcStartDate),
				  endDate : new Date($scope.item.amcEndDate),
				  cost : $scope.item.amcAmount,
		          documentName : 'Vendor Contract',
		          documentDescription : $scope.item.vendorName,
		          accessLevel : 'Admin',
		          flatnumber: '*'		
				}
            ]
  });

  uploader.onAfterAddingFile = function(fileItem) {
	     $scope.contractDocs.push(fileItem.file.name);
  };

  uploader.onBeforeUploadItem = function(item) {

        var startDate = $filter('date')($scope.item.amcStartDate, "MM/yyyy");
		var endDate = $filter('date')($scope.item.amcEndDate, "MM/yyyy");

	    item.formData[0].vendorName = $scope.item.vendorName;
		item.formData[0].startDate = new Date($scope.item.amcStartDate);
		item.formData[0].endDate = new Date($scope.item.amcEndDate);
		item.formData[0].cost = $scope.item.amcAmount;
		item.formData[0].documentName = 'Vendor Contract';
		item.formData[0].documentDescription = $scope.item.vendorName + '(' + startDate + ' to ' + endDate + ')';
		item.formData[0].accessLevel = 'Admin';
		item.formData[0].flatnumber = '-';
  };

  $scope.ok = function () {	
	  uploader.uploadAll();
	  $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.isInvalid = function () {
	   return (!$scope.contact.name || 0 === $scope.contact.name.length);
  }

}]);

angular.module('magnoliaApp')
.controller('ModalAmcCtrl',['$scope','$modal','$log',function($scope, $modal, $log) {

	$scope.open = function (item,index) {
		$scope.active = item;
		var modalInstance = $modal.open({
		  templateUrl: 'amcModal',
          scope : $scope,
          backdrop: 'static',
		  controller: 'ModalInstanceAmcCtrl',
		  windowClass : 'modal-huge',
		  resolve: {
			item: function () {
			  return item;
			}
		  }
		});

		modalInstance.result.then(function (selectedItem) {}, function () {
				console.log("amc updated");
				}, function () {
				console.log("canceled");
		});
	};

}]);


angular.module('magnoliaApp')
.controller('ModalInstanceAmcCtrl',['$scope','$modalInstance','$window',function($scope,$modalInstance,$window) {

  $scope.getDoc = function(item) {
	   $window.open("/api/documents/" + item._id);	
  }

  $scope.ok = function () {	
		$modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


}]);
