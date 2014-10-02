'use strict';

angular.module('magnoliaApp').constant('CONFIG', {
	'maxFileSize' : 8,
    'allowedFileExtn' : '|msword|vnd.openxmlformats-officedocument.presentationml.presentation|vnd.ms-powerpoint|x-zip-compressed|pdf|txt|xml|csv|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.openxmlformats-officedocument.wordprocessingml.document|'
});

angular.module('magnoliaApp')
.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public, apartmentnumber:'' };

    $cookieStore.remove('user');

    function changeUser(user) {
        _.extend(currentUser, user);
    };

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;

            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        },
        forgot: function(userEmail, success, error) {
            $http.post('/forgot', userEmail).success(function(res) {
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('/login', user).success(function(user){
                changeUser(user);
                success(user);
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public,
					apartmentnumber: ''
                });

				if(success){
					success();
				}
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});

angular.module('magnoliaApp')
.factory('Users', function($http) {
    return {
        getAll: function(success, error) {
            $http.get('/users').success(success).error(error);
        }
    };
});

angular.module('magnoliaApp')
.factory('Apartments', function ($resource) {
    return $resource('/api/apartments/:id', {}, {});
});

angular.module('magnoliaApp')
.factory('Payments', function ($resource) {
    return $resource('/api/payments/:id', {}, {"update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Receipts', function ($resource) {
    return $resource('/api/receipts/:id', {}, {"update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Vendors', function ($resource) {
    return $resource('/api/vendors/:id', {}, {"update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Documents', function ($resource) {
    return $resource('/api/documents/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Members', function ($resource) {
    return $resource('/api/members/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('AMC', function ($resource) {
    return $resource('/api/amc/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('FunctionalAreas', function ($resource) {
    return $resource('/api/functionalareas/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('FinancialAssets', function ($resource) {
    return $resource('/api/financialassets/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Tasks', function ($resource) {
    return $resource('/api/tasks/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('AppUsers', function ($resource) {
    return $resource('/api/users/:id', {}, { "update": {
            method: 'PUT'
        }});
});

angular.module('magnoliaApp')
.factory('Registrations', function ($resource) {
    return $resource('/api/registrations/:id', {}, { "update": {
            method: 'PUT'
        }});
});



angular.module('magnoliaApp')
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', function ($rootScope, $compile, $http, $timeout) {
        var printHtml = function (html) {
            var hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
            hiddenFrame.contentWindow.printAndRemove = function() {
                hiddenFrame.contentWindow.print();
                $(hiddenFrame).remove();
            };
            var htmlContent = "<!doctype html>"+
                        "<html>"+
                            '<body onload="printAndRemove();">' +
                                html +
                            '</body>'+
                        "</html>";
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write(htmlContent);
            doc.close();
        };

        var openNewWindow = function (html) {
            var newWindow = window.open("printTest.html");
            newWindow.addEventListener('load', function(){ 
                $(newWindow.document.body).html(html);
            }, false);
        };

        var print = function (templateUrl, data) {
            $http.get(templateUrl).success(function(template){
                var printScope = $rootScope.$new()
                angular.extend(printScope, data);
                var element = $compile($('<div>' + template + '</div>'))(printScope);
                var waitForRenderAndPrint = function() {
                    if(printScope.$$phase || $http.pendingRequests.length) {
                        $timeout(waitForRenderAndPrint);
                    } else {
                        // Replace printHtml with openNewWindow for debugging
                        printHtml(element.html());
                        printScope.$destroy();
                    }
                }
                waitForRenderAndPrint();
            });
        };

        return {
            print: print
        }
}]);

