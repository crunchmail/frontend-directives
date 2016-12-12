/**
 * @ngdoc directive
 * @name applications.directive:cmFormRegen
 * @description
 * Update application or regen secret
 * @scope
 * @param {Object} app Passing object application smtp or api
 * @param {Object} regenUrl Passing url to regen secret
 * @param {Function} onCancel Cancel function to close dialog window
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
            templateUrl:'views/applications/formRegen.html',
            scope: {
                "app": "=",
                "regenUrl": "=",
                "onCancel": "&"
            },
            controller: function($scope) {
                /**
                 * @ngdoc function
                 * @name close
                 * @methodOf applications.directive:cmFormRegen
                 * @param {Event} e DOM event
                 * @description
                 * Close dialog window
                 */
                $scope.close = function(e) {
                    e.preventDefault();
                    $scope.onCancel();
                };

                $scope.cloneApp = _.clone($scope.app);

                /**
                 * @ngdoc function
                 * @name regenSecret
                 * @methodOf applications.directive:cmFormRegen
                 * @description
                 * Regen secret for an application
                 */
                $scope.regenSecret = function() {
                    apiApplications.regen($scope.regenUrl).then(function(result) {
                        $scope.app.secret = result.data;
                        cmNotify.message(gettextCatalog.getString("Your secret has been regenerated"), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your secret hasn't been regenerated"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name udpateApp
                 * @methodOf applications.directive:cmFormRegen
                 * @description
                 * Update an application
                 */
                $scope.udpateApp = function() {
                    apiApplications.udpate($scope.cloneApp.url, $scope.cloneApp).then(function(result) {
                        $scope.app = result.data;
                        cmNotify.message(gettextCatalog.getString("Your application has been udpated"), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your application hasn't been udpated"), "error");
                    });
                };
            }
        };

    };

    module.exports = directive;
}());
