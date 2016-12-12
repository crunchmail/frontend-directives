/**
 * @ngdoc service
 * @name login.factory:apiLogin
 * @description
 * API shortcut for Login
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($http, $rootScope) {
        return {
            login: function(user) {
                return $http.post($rootScope.authToken, user).then(function(result) {
                    return result.data;
                });
            },
            logout: function() {
                //TODO
            }
        };

    };

    module.exports = factory;
}());
