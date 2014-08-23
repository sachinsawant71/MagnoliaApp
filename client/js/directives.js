'use strict';

angular.module('magnoliaApp')
.directive('accessLevel', ['Auth', function(Auth) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var prevDisp = element.css('display')
                , userRole
                , accessLevel;

            $scope.user = Auth.user;
            $scope.$watch('user', function(user) {
                if(user.role)
                    userRole = user.role;
                updateCSS();
            }, true);

            attrs.$observe('accessLevel', function(al) {
                if(al) accessLevel = $scope.$eval(al);
                updateCSS();
            });

            function updateCSS() {
                if(userRole && accessLevel) {
                    if(!Auth.authorize(accessLevel, userRole))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                }
            }
        }
    };
}]);

angular.module('magnoliaApp').directive('activeNav', ['$location', function($location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var anchor = element[0];
            if(element[0].tagName.toUpperCase() != 'A')
                anchor = element.find('a')[0];
            var path = anchor.href;

            scope.location = $location;
            scope.$watch('location.absUrl()', function(newPath) {
                path = normalizeUrl(path);
                newPath = normalizeUrl(newPath);

                if(path === newPath ||
                    (attrs.activeNav === 'nestedTop' && newPath.indexOf(path) === 0)) {
                    element.parent().addClass('active');
                } else {
                    element.parent().removeClass('active');
                }
            });
        }

    };

    function normalizeUrl(url) {
        if(url[url.length - 1] !== '/')
            url = url + '/';
        return url;
    }

}]);


angular.module('magnoliaApp').directive('money', [function() {
  'use strict';

  var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
  function isUndefined(value) {
    return typeof value == 'undefined';
  }
  function isEmpty(value) {
    return isUndefined(value) || value === '' || value === null || value !== value;
  }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      function round(num) { 
        return Math.round(num * 100) / 100;
      }

      var min = parseFloat(attr.min) || 0;

      // Returning NaN so that the formatter won't render invalid chars
      ctrl.$parsers.push(function(value) {
        // Handle leading decimal point, like ".5"
        if (value === '.') {
          ctrl.$setValidity('number', true);
          return 0;
        }

        // Allow "-" inputs only when min < 0
        if (value === '-') {
          ctrl.$setValidity('number', false);
          return (min < 0) ? -0 : NaN;
        }

        var empty = isEmpty(value);
        if (empty || NUMBER_REGEXP.test(value)) {
          ctrl.$setValidity('number', true);
          return value === '' ? null : (empty ? value : parseFloat(value));
        } else {
          ctrl.$setValidity('number', false);
          return NaN;
        }
      });
      ctrl.$formatters.push(function(value) {
        return isEmpty(value) ? '' : '' + value;
      });

      var minValidator = function(value) {
        if (!isEmpty(value) && value < min) {
          ctrl.$setValidity('min', false);
          return undefined;
        } else {
          ctrl.$setValidity('min', true);
          return value;
        }
      };
      ctrl.$parsers.push(minValidator);
      ctrl.$formatters.push(minValidator);

      if (attr.max) {
        var max = parseFloat(attr.max);
        var maxValidator = function(value) {
          if (!isEmpty(value) && value > max) {
            ctrl.$setValidity('max', false);
            return undefined;
          } else {
            ctrl.$setValidity('max', true);
            return value;
          }
        };

        ctrl.$parsers.push(maxValidator);
        ctrl.$formatters.push(maxValidator);
      }

      // Round off to 2 decimal places
      ctrl.$parsers.push(function (value) {
        return value ? round(value) : value;
      });
      ctrl.$formatters.push(function (value) {
        return value ? parseFloat(value).toFixed(2) : value;
      });

      el.bind('blur', function () {
        var value = ctrl.$modelValue;
        if (value) {
          ctrl.$viewValue = round(value).toFixed(2);
          ctrl.$render();
        }
      });
    }
  };
}]);

angular.module('magnoliaApp').directive('capitalize', [function() {

   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
		   if (inputValue) {
			   var capitalized = inputValue.toUpperCase();
			   if(capitalized !== inputValue) {
				  modelCtrl.$setViewValue(capitalized);
				  modelCtrl.$render();
				}         
				return capitalized;
		   }

         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
}]);


angular.module('magnoliaApp').directive('numbersOnly', [function() {

	 return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input. 
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue == undefined) return '' 
           var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         

           return transformedInput;         
       });
     }
   };

}]);




angular.module('magnoliaApp').directive('printDiv', ['$document',function($document) {

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function(evt){    
        evt.preventDefault();    		
        PrintElem(angular.element('#' +attrs.printElement),attrs.printTitle);
      });

      function PrintElem(elem,title) {
        PrintWithIframe($(elem).html(),title);
      }

      function PrintWithIframe(data,title) 
      {
		  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
					var popupWin = window.open('', '_blank', 'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
					popupWin.window.focus();
					popupWin.document.write('<!DOCTYPE html><html><head>' +
						'<title>'+ title +'</title><link href="/css/gridforms.css" rel="stylesheet" type="text/css" />' +
						'</head><body onload="window.print()">' + data + '</body></html>');
					popupWin.onbeforeunload = function (event) {
						popupWin.close();
						return '.\n';
					};
					popupWin.onabort = function (event) {
						popupWin.document.close();
						popupWin.close();
					}
			} else {
					var popupWin = window.open('', '_blank', 'width=800,height=600');
					popupWin.document.open();
					popupWin.document.write('<html><head><title>'+ title +'</title><link href="/css/gridforms.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' 
						+ data + '</html>');
					popupWin.document.close();
			}
			popupWin.document.close();

			return true;

      }
    }
  };
}]);


angular.module('magnoliaApp').directive('onBlurChange', function ($parse) {
  return function (scope, element, attr) {
    var fn = $parse(attr['onBlurChange']);
    var hasChanged = false;
    element.on('change', function (event) {
      hasChanged = true;
    });
 
    element.on('blur', function (event) {
      if (hasChanged) {
        scope.$apply(function () {
          fn(scope, {$event: event});
        });
        hasChanged = false;
      }
    });
  };
});


angular.module('magnoliaApp').directive('onEnterBlur', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        element.blur();
        event.preventDefault();
      }
    });
  };
});


