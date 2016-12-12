/**
 * @ngdoc directive
 * @name user.directive:cmRegister
 * @description
 * Directive to register a new user
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires user.factory:apiUser
 * @requires _factory.factory:cmNotify
 * @requires gettextCatalog
 * @requires Lodash
 */
(function () {
    'use strict';

    var directive = function(_, $log, apiUser, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/user/register.html',
            controller: function($scope) {
                $scope.newUser = {
                    "user": {},
                    "organization": {}
                };

                $scope.errors = {};

                $scope.passwordInvalid = true;

                /**
                 * @ngdoc function
                 * @name register
                 * @methodOf user.directive:cmRegister
                 * @description
                 * Register a new user
                 */
                $scope.register = function() {
                    $log.debug($scope.newUser);
                    apiUser.register($scope.newUser).then(function(success) {
                        cmNotify.message(gettextCatalog.getString("Your account and your organization have been created"), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your account and your organization haven't been created"), "error");
                        $scope.errors = error.data;
                    });
                };

                $scope.$watch("confirmPassword", function(n, o) {
                    if(!_.isUndefined(n) && n === $scope.newUser.user.password) {
                        $log.debug("valid");
                        $scope.passwordInvalid = false;
                    }else {
                        $scope.passwordInvalid = true;
                    }
                });

                $scope.$watch("newUser.user.identifier", function(n, o) {
                    $scope.newUser.organization.contact_email = n;
                }, true);
            }
        };

    };

    module.exports = directive;
}());
