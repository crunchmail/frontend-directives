/**
 * @ngdoc directive
 * @name user.directive:cmProfile
 * @description
 * Display user profile
 * @requires user.factory:apiUser
 * @requires _factory.factory:cmNotify
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(apiUser, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/user/profile.html',
            link: function(scope, element, attrs) {
                apiUser.getApiKey();
                scope.userInfo = apiUser.userInfo;
                var user = {};

                apiUser.getProfile().then(function(result) {
                    user = result.data;
                });

                /**
                 * @ngdoc function
                 * @name regenSecret
                 * @methodOf user.directive:cmProfile
                 * @description
                 * Regeneration secret, API key
                 */
                scope.regenSecret = function() {
                    apiUser.regenSecret(user._links.regen_secret.href).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Secret regenerated"), "success");
                        scope.userInfo.secret = result.data;
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your secret has not been regenerated"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name changePassword
                 * @methodOf user.directive:cmProfile
                 * @description
                 * Change password
                 */
                scope.changePassword = function() {
                    apiUser.resetPswd(scope.userInfo.identifier).then(function(result) {

                    });
                };
            }
        };
    };

    module.exports = directive;

}());
