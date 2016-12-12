/**
 * @ngdoc directive
 * @name login.directive:cmResetForm
 * @description
 * List a domain
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires user.factory:apiUser
 */
(function () {
    'use strict';

    var directive = function(apiUser, $log, $rootScope) {
        return {
            templateUrl:'views/login/resetForm.html',
            controller: function($scope) {
                $rootScope.hideMenu = true;
                $scope.user = {};
                $scope.resetDone = false;
                /**
                 * @ngdoc function
                 * @name resetPassword
                 * @methodOf login.directive:cmResetForm
                 * @description
                 * Send a email to the user to renew his password
                 */
                $scope.resetPassword = function() {
                    apiUser.resetPswd($scope.user.identifier).then(function(result) {
                        $log.debug(result);
                        $scope.resetDone = true;
                    });
                };
            }
        };
    };

    module.exports = directive;
}());
