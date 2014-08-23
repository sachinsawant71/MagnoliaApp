'use strict';

angular.module('magnoliaApp', ['ngCookies', 'ui.router','ngResource','naturalSort','ui.tinymce','ui.checkbox','ui.bootstrap','ui.bootstrap.alerts','angularFileUpload','mgo-angular-wizard','textAngular','ngCsv'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    var access = routingConfig.accessLevels;

    // Public routes
    $stateProvider
        .state('public', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.public
            }
        })
        .state('public.login', {
            url: '/',
            templateUrl: 'login',
            controller: 'LoginCtrl'
        })
		.state('public.404', {
            url: '/404/',
            templateUrl: '404'
        });

    // Anonymous routes
    $stateProvider
        .state('anon', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.anon
            }
        })
        .state('anon.login', {
            url: '/login/',
            templateUrl: 'login',
            controller: 'LoginCtrl'
        })
        .state('anon.register', {
            url: '/register/',
            templateUrl: 'register',
            controller: 'RegisterCtrl'
        });

    // Regular user routes
    $stateProvider
        .state('user', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.user
            }
        })
        .state('user.private', {
            url: '/user/',
            templateUrl: 'private/userlayout'
        })
        .state('user.private.details', {
            url: 'details/',
            templateUrl: 'private/userdetails',
			controller: 'UserDetailCtrl'
        })
        .state('user.private.payments', {
            url: 'payments/',
            templateUrl: 'private/userpayments',
            controller: 'UserPaymentCtrl'
        })
        .state('user.private.requests', {
            url: 'requests/',
            templateUrl: 'private/userrequests',
        })
        .state('user.private.rulebook', {
            url: 'rulebook/',
            templateUrl: 'private/aptrulebook',
        })

    // Admin routes
    $stateProvider
        .state('admin', {
            abstract: true,
            template: "<ui-view/>",
            data: {
                access: access.admin
            }
        })
        .state('admin.admin', {
            url: '/admin/',
            templateUrl: 'private/adminlayout',
            controller: 'AdminCtrl'
        })
		.state('admin.admin.apartments', {
            url: 'apartments/',
            templateUrl: 'private/apartments',
            controller: 'ApartmentCtrl'
        })
        .state('admin.admin.payments', {
            url: 'payments/',
            templateUrl: 'private/payments',
			controller: 'PaymentsCtrl'
        })
        .state('admin.admin.receipts', {
            url: 'receipts/',
            templateUrl: 'private/receipts',
			controller: 'ReceiptsCtrl'
        })
        .state('admin.admin.contracts', {
            url: 'contracts/',
            templateUrl: 'private/contracts',
			controller: 'VendorCtrl'
        })
        .state('admin.admin.members', {
            url: 'members/',
            templateUrl: 'private/members',
			controller: 'MembersCtrl'
        })
        .state('admin.admin.dashboard', {
            url: 'dashboard/',
            templateUrl: 'private/dashboard',
			controller: 'DashboardCtrl'
        })
        .state('admin.admin.documents', {
            url: 'documents/',
            templateUrl: 'private/documents',
			controller: 'DocumentsCtrl'
        });

		
    $urlRouterProvider.otherwise('/404');

    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    $urlRouterProvider.rule(function($injector, $location) {
        if($location.protocol() === 'file')
            return;

        var path = $location.path()
        // Note: misnomer. This returns a query object, not a search string
            , search = $location.search()
            , params
            ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
            return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
            return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
            params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
    });

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/login');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        }
    });

}])

.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (!Auth.authorize(toState.data.access)) {
            $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
            event.preventDefault();
            
            if(fromState.url === '^') {
                if(Auth.isLoggedIn())
                    $state.go('user.home');
                else {
                    $rootScope.error = null;
                    $state.go('anon.login');
                }
            }
        }
    });

}]);