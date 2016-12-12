/**
 * @ngdoc directive
 * @name domains.directive:cmDialogCreateDomain
 * @description
 * Directive to show a dialog which create a new domain
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires domains.factory:apiDomains
 * @requires _factory.factory:cmNotify
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(apiDomains, $log, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/domains/dialogCreateDomain.html',
            controller: function($scope) {
                $scope.domain = {};
                /**
                 * @ngdoc function
                 * @name createDomain
                 * @methodOf domains.directive:cmDialogCreateDomain
                 * @description
                 * Create a new domain
                 */
                $scope.createDomain = function() {
                    apiDomains.createDomain($scope.domain).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your domain has been created"), "success");
                        $scope.confirm(result.data);
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your domain hasn't been created"), "error");
                        $scope.showError = true;
                        $log.debug(error.data.non_field_errors[0]);
                        $scope.messageError = error.data.non_field_errors[0];
                    });
                };

                /**
                 * @ngdoc function
                 * @name checkUrl
                 * @methodOf domains.directive:cmDialogCreateDomain
                 * @description
                 * Check url to detect if we have a correct domain url
                 */
                $scope.checkUrl = function() {
                    var domainRegexp = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/;

                    if(domainRegexp.test($scope.domain.name)) {
                        return false;
                    }else {
                        return true;
                    }
                };
            }
        };
    };

    module.exports = directive;

}());
