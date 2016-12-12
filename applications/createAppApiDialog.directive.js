/**
 * @ngdoc directive
 * @name applications.directive:cmCreateAppApiDialog
 * @description
 * ngDialog to create a new api application
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
            templateUrl:'views/applications/createAppApiDialog.html',
            controller: function($scope) {
                $scope.appApi = {};
                /**
                 * @ngdoc function
                 * @name createAppApi
                 * @methodOf applications.directive:cmCreateAppApiDialog
                 * @description
                 * Create an api application
                 */
                $scope.createAppApi = function() {
                    apiApplications.createApi($scope.appApi).then(function(result) {
                        $scope.confirm(result.data);
                    });
                };
            }
        };

    };

    module.exports = directive;
}());
