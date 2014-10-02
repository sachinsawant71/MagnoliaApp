var _ =           require('underscore')
    , path =      require('path')
    , passport =  require('passport')
    , AuthCtrl =  require('./controllers/auth')
    , UserCtrl =  require('./controllers/user')
	, AptCtrl  =  require('./controllers/apartment')
	, ReceiptCtrl  =  require('./controllers/receipt')
	, PaymentCtrl  =  require('./controllers/payment')
	, VendorCtrl  =  require('./controllers/vendor')
	, UploadCtrl  =  require('./controllers/upload')
	, MemberCtrl  =  require('./controllers/member')
	, UsersCtrl   =  require('./controllers/appUser')
	, AmcCtrl  =  require('./controllers/amc')
	, FinancialAssetCtrl  =  require('./controllers/financialAssets')
	, TasksCtrl  =  require('./controllers/task')
	, RegistrationsCtrl  =  require('./controllers/registration')
	, FuntionalAreaCtrl =  require('./controllers/functionalArea')
    , User =      require('./models/User.js')
    , userRoles = require('../client/js/routingConfig').userRoles
    , accessLevels = require('../client/js/routingConfig').accessLevels
	, email = require('./services/email-dispatcher');

var routes = [

    // Views
    {
        path: '/partials/*',
        httpMethod: 'GET',
        middleware: [function (req, res) {
            var requestedView = path.join('./', req.url);
            res.render(requestedView);
        }]
    },
    // Local Auth
    {
        path: '/register',
        httpMethod: 'POST',
        middleware: [AuthCtrl.register]
    },
    {
        path: '/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login]
    },
    {
        path: '/logout',
        httpMethod: 'POST',
        middleware: [AuthCtrl.logout]
    },
    {
        path: '/forgot',
        httpMethod: 'POST',
        middleware: [AuthCtrl.forgot]
    },
    {
        path: '/users',
        httpMethod: 'GET',
        middleware: [UserCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/apartments',
        httpMethod: 'GET',
        middleware: [AptCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/apartments/:id',
        httpMethod: 'GET', 
        middleware: [AptCtrl.findById]
    },
    {
        path: '/api/apartments/defaulters/:id',
        httpMethod: 'GET', 
        middleware: [AptCtrl.getPaymentDefaulters],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/apartmentnumbers',
        httpMethod: 'GET', 
        middleware: [AptCtrl.getAllAptNo],
        accessLevel: accessLevels.public
    },
    {
        path: '/api/apartments/owner/:id',
        httpMethod: 'GET', 
        middleware: [AptCtrl.getOwnerByAptNo],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/apartments',
        httpMethod: 'POST', 
        middleware: [AptCtrl.update]
    },
    {
        path: '/api/aptsummary',
        httpMethod: 'POST',
        middleware: [AptCtrl.getApartmentSummary],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/sendEmail',
        httpMethod: 'POST',
        middleware: [AptCtrl.sendEmail],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/paymentsummary',
        httpMethod: 'POST',
        middleware: [AptCtrl.sendMaintenanceStatementToAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/newperiod',
        httpMethod: 'POST',
        middleware: [AptCtrl.addNewMaintenancePeriod],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/payments',
        httpMethod: 'GET',
        middleware: [PaymentCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/payments/:id',
        httpMethod: 'GET', 
        middleware: [PaymentCtrl.findById]
    },
    {
        path: '/api/payments/:id',
        httpMethod: 'DELETE', 
        middleware: [PaymentCtrl.delete]
    },
    {
        path: '/api/payments',
        httpMethod: 'POST', 
        middleware: [PaymentCtrl.add]
    },
    {
        path: '/api/vendors',
        httpMethod: 'GET',
        middleware: [VendorCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/vendors/:id',
        httpMethod: 'GET', 
        middleware: [VendorCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/vendors/:id',
        httpMethod: 'DELETE', 
        middleware: [VendorCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/vendors',
        httpMethod: 'POST', 
        middleware: [VendorCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/vendors/:id',
        httpMethod: 'PUT', 
        middleware: [VendorCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/receipts',
        httpMethod: 'GET',
        middleware: [ReceiptCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/receipts/:id',
        httpMethod: 'GET', 
        middleware: [ReceiptCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/receipts/:id',
        httpMethod: 'DELETE', 
        middleware: [ReceiptCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/receipts',
        httpMethod: 'POST', 
        middleware: [ReceiptCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/receiptConfirmation',
        httpMethod: 'GET', 
        middleware: [ReceiptCtrl.getConfirmation],
		accessLevel: accessLevels.admin
    },

    {
        path: '/api/receipts/:id',
        httpMethod: 'PUT', 
        middleware: [ReceiptCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/upload',
        httpMethod: 'POST', 
        middleware: [UploadCtrl.upload],
		accessLevel: accessLevels.admin
    },
    {
        path: '/api/documents',
        httpMethod: 'GET', 
        middleware: [UploadCtrl.findAll],
		accessLevel: accessLevels.admin
    },
    {
        path: '/api/documents/:id',
        httpMethod: 'GET',
        middleware: [UploadCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/documents/:id',
        httpMethod: 'DELETE', 
        middleware: [UploadCtrl.delete],
		accessLevel: accessLevels.admin
    },
    {
        path: '/api/members',
        httpMethod: 'GET',
        middleware: [MemberCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/members/:id',
        httpMethod: 'GET', 
        middleware: [MemberCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/members/:id',
        httpMethod: 'DELETE', 
        middleware: [MemberCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/members',
        httpMethod: 'POST', 
        middleware: [MemberCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/members/:id',
        httpMethod: 'PUT', 
        middleware: [MemberCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/amc',
        httpMethod: 'GET',
        middleware: [AmcCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/amc',
        httpMethod: 'POST', 
        middleware: [AmcCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/amc/:id',
        httpMethod: 'GET', 
        middleware: [AmcCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/amc/:id',
        httpMethod: 'DELETE', 
        middleware: [AmcCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/financialassets',
        httpMethod: 'GET',
        middleware: [FinancialAssetCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/financialassets',
        httpMethod: 'POST', 
        middleware: [FinancialAssetCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/financialassets/:id',
        httpMethod: 'GET', 
        middleware: [FinancialAssetCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/financialassets/:id',
        httpMethod: 'DELETE', 
        middleware: [FinancialAssetCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/functionalareas',
        httpMethod: 'GET',
        middleware: [FuntionalAreaCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/functionalareas',
        httpMethod: 'POST', 
        middleware: [FuntionalAreaCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/functionalareas/:id',
        httpMethod: 'GET', 
        middleware: [FuntionalAreaCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/functionalareas/:id',
        httpMethod: 'DELETE', 
        middleware: [FuntionalAreaCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/tasks',
        httpMethod: 'GET',
        middleware: [TasksCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/tasks',
        httpMethod: 'POST', 
        middleware: [TasksCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/tasks/:id',
        httpMethod: 'GET', 
        middleware: [TasksCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/tasks/:id',
        httpMethod: 'DELETE', 
        middleware: [TasksCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/tasks/:id',
        httpMethod: 'PUT', 
        middleware: [TasksCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/users',
        httpMethod: 'GET',
        middleware: [UsersCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/users',
        httpMethod: 'POST', 
        middleware: [UsersCtrl.add],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/users/:id',
        httpMethod: 'GET', 
        middleware: [UsersCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/users/:id',
        httpMethod: 'DELETE', 
        middleware: [UsersCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/users/:id',
        httpMethod: 'PUT', 
        middleware: [UsersCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/registrations',
        httpMethod: 'GET',
        middleware: [RegistrationsCtrl.findAll],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/registrations',
        httpMethod: 'POST', 
        middleware: [RegistrationsCtrl.add]
    },
    {
        path: '/api/registrations/:id',
        httpMethod: 'GET', 
        middleware: [RegistrationsCtrl.findById],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/registrations/:id',
        httpMethod: 'DELETE', 
        middleware: [RegistrationsCtrl.delete],
        accessLevel: accessLevels.admin
    },
    {
        path: '/api/registrations/:id',
        httpMethod: 'PUT', 
        middleware: [RegistrationsCtrl.update],
        accessLevel: accessLevels.admin
    },
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {   
            var role = userRoles.public, username = '';
            if(req.user) {
                role = req.user.role;
                username = req.user.username;
            }
            res.cookie('user', JSON.stringify({
                'username': username,
                'role': role
            }));
            res.render('index');
        }]
    }
];

module.exports = function(app) {

    _.each(routes, function(route) {
        route.middleware.unshift(ensureAuthorized);
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT': 
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });
}

function ensureAuthorized(req, res, next) {
    var role;
    if(!req.user) role = userRoles.public;
    else          role = req.user.role;

	var accessLevel = _.findWhere(routes, { path: req.route.path,httpMethod: req.method}).accessLevel || accessLevels.public;

    if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
    return next();
}