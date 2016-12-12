/**
 * @ngdoc directive
 * @name organizations.directive:cmEditOrganization
 * @description
 * A directive to edit an organization
 * @scope
 * @param {Object} organization Passing the organization object
 * @param {Function} onCancel close function from ngDialog
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires organizations.factory:apiOrganization
 * @requires _factory.factory:cmNotify
 * @requires Lodash
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(apiOrganization, _, $log, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/organizations/editOrganization.html',
            scope: {
                "organization": "=",
                "onCancel": "&"
            },
            controller: function($scope) {
                $scope.cloneOrganization = _.cloneDeep($scope.organization);
                /**
                 * @ngdoc function
                 * @name updateOrganization
                 * @methodOf organizations.directive:cmEditOrganization
                 * @description
                 * Update an organization
                 */
                $scope.updateOrganization = function() {
                    $log.debug($scope.cloneOrganization);
                    apiOrganization.update($scope.cloneOrganization.url, $scope.cloneOrganization).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your domain has been udpated"), "success");
                        $scope.organization = result.data;
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your domain hasn't been udpated"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name close
                 * @methodOf organizations.directive:cmEditOrganization
                 * @description
                 * Close the dialog
                 */
                $scope.close = function(e) {
                    e.preventDefault();
                    $scope.onCancel();
                };
            }
        };
    };

    module.exports = directive;

}());
