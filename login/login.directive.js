/**
 * @ngdoc directive
 * @name login.directive:cmLogin
 * @description
 * List a domain
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires _factory.factory:tokenHandler
 * @requires login.factory:apiLogin
 * @requires user.factory:apiUser
 * @requires gettextCatalog
 * @requires Lodash
 */
(function () {
    'use strict';

    var directive = function(tokenHandler, apiLogin, $log, $location,
        $rootScope, apiUser, _, appSettings, cmNotify) {
        return {
            templateUrl:'views/login/login.html',
            controller: function($scope) {
                $scope.user = {};
                /**
                 * @ngdoc function
                 * @name connect
                 * @methodOf login.directive:cmLogin
                 * @description
                 * Passing the user credential, get the user profile and set a global variable
                 */
                $scope.connect = function() {
                    apiLogin.login($scope.user).then(function(data) {
                        /*
                        * Save & refresh token
                        */
                        tokenHandler.saveToken(data.token);
                        tokenHandler.refreshToken(data.token);
                        if(appSettings.source === "Zimlet") {
                            console.log("get ApiKey");
                            apiUser.getApiKey();
                        }

                        apiUser.getProfile().then(function(result) {
                            $log.debug(result);
                            apiUser.setInfo(result.data);
                            _.forOwn(result.data.groups, function(v, k) {
                                if(v === "administrators") {
                                    $rootScope.isAdmin = true;
                                }else {
                                    $rootScope.isAdmin = false;
                                }
                            });
                        });
                        /*
                        * redirect to dashboard
                        */
                        $location.url('/dashboard');
                    }, function(error) {
                        _.forOwn(error.data, function(v, k) {
                            cmNotify.message(v, "error");
                        });

                    });
                };
            }
        };

    };

    module.exports = directive;
}());
