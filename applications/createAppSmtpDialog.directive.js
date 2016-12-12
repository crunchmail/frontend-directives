/**
 * @ngdoc directive
 * @name applications.directive:cmCreateAppSmtpDialog
 * @description
 * ngDialog to create a new smtp application
 * @restrict E
 * @requires applications.factory:apiApplications
 * @requires _factory.factory:cmNotify
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(_, $log, apiApplications, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/applications/createAppSmtpDialog.html',
            controller: function($scope) {
                $scope.appSmtp = {};
                /**
                 * @ngdoc function
                 * @name createAppSmtp
                 * @methodOf applications.directive:cmCreateAppSmtpDialog
                 * @description
                 * Create an smtp application
                 */
                $scope.createAppSmtp = function() {
                    apiApplications.createSmtp($scope.appSmtp).then(function(result) {
                        $scope.confirm(result.data);
                    });
                };
            }
        };

    };

    module.exports = directive;
}());
