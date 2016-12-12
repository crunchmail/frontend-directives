/**
 * @ngdoc directive
 * @name user.directive:cmMenuProfile
 * @description
 * Display menu profile
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires _factory.factory:postMessageHandler
 * @requires _factory.factory:tokenHandler
 * @requires appSettings
 */
(function () {
    'use strict';

    var directive = function($location, appSettings, postMessageHandler, tokenHandler, $log) {
        return {
            templateUrl:'views/user/menuProfile.html',
            link: function(scope, element, attrs) {
                /**
                 * @ngdoc function
                 * @methodOf user.directive:cmMenuProfile
                 * @name logout
                 * @description
                 * Logout the user
                 */
                scope.logout = function() {
                    /*
                    * Delete Token and remove Authorization header JWT
                    */
                    tokenHandler.deleteToken();
                    tokenHandler.removeHeader();
                    appSettings.apiKey = "";
                    var objToSend = {
                        "apiKey" : ""
                    };
                    /*
                    * Send to zimbra apiKey empty
                    */
                    postMessageHandler.post(objToSend);
                    $location.path("/");
                };


            }
        };
    };

    module.exports = directive;

}());
