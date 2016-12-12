/**
 * @ngdoc directive
 * @name organizations.directive:cmDialogOrganization
 * @description
 * A directive to create a new organization
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires _factory.factory:cmNotify
 * @requires user.factory:apiUser
 * @requires organizations.factory:apiOrganization
 * @requires Lodash
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(apiOrganization, $log, cmNotify, gettextCatalog, apiUser) {
        return {
            templateUrl:'views/organizations/dialogCreateOrganization.html',
            controller: function($scope) {
                /**
                 * @ngdoc property
                 * @name organization
                 * @propertyOf organizations.directive:cmDialogOrganization
                 * @description
                 * Init an organization object with the user email
                 */
                $scope.organization = {
                    "contact_email": apiUser.userInfo.email
                };
                /**
                 * Get all organizations
                 */
                apiOrganization.getAll().then(function(organizations) {
                    $scope.listOrganizations = organizations;
                    $scope.organization.parent = $scope.listOrganizations[0].url;
                });
                /**
                 * @ngdoc function
                 * @name createOrganization
                 * @methodOf organizations.directive:cmDialogOrganization
                 * @description
                 * Create a new organization
                 */
                $scope.createOrganization = function() {
                    apiOrganization.createOrganization($scope.organization).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your organization has been created"), "success");
                        $scope.confirm(result.data);
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your organization hasn't been created"), "error");
                        $log.debug(error);
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
