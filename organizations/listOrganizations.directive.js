/**
 * @ngdoc directive
 * @name organizations.directive:cmListOrganizations
 * @description
 * A directive to invite a user in an organization
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires organizations.factory:apiOrganization
 * @requires https://github.com/likeastore/ngDialog
 * @requires _factory.factory:cmNotify
 * @requires Lodash
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(apiOrganization, _, $log, ngDialog, gettextCatalog, cmNotify) {
        return {
            templateUrl:'views/organizations/listOrganizations.html',
            controller: function($scope) {
                $scope.childOrganization = [];

                /**
                 * Get all organizations
                 */
                apiOrganization.getAll().then(function(organization) {
                    $scope.principalOrganization = organization[0];
                    apiOrganization.getChilds(organization[0]).then(function(child) {
                        if(child.length > 0) {
                            $scope.childOrganization = child;
                        }
                    });
                    //$scope.childOrganization = "";
                });

                /**
                 * @ngdoc function
                 * @name showOrganizationDialog
                 * @methodOf organizations.directive:cmListOrganizations
                 * @description
                 * Display a dialog to create a new oragnization, get the result with the success promise and push it into an array with others organizations
                 */
                $scope.showOrganizationDialog = function() {
                    ngDialog.openConfirm({
                        template: '<cm-create-organization-dialog></cm-create-organization-dialog>',
                        plain: true
                    }).then(function(result) {
                        $scope.childOrganization.push(result);
                    });
                };

                /**
                 * @ngdoc function
                 * @name showOrganizationDialog
                 * @methodOf organizations.directive:cmListOrganizations
                 * @param {Object} organization Passing the organization object
                 * @description
                 * Display a dialog to invite a user, get the result with the success promise and push it to API
                 */
                $scope.inviteUser = function(organization) {
                    var urlInviteUser = organization._links.invite_user.href;
                    ngDialog.openConfirm({
                        template: '<cm-invite-user-dialog></cm-invite-user-dialog>',
                        plain: true
                    }).then(function(result) {
                        result.organization = organization.url;
                        apiOrganization.inviteUser(urlInviteUser, result).then(function(success) {
                            cmNotify.message(gettextCatalog.getString("Your invitation has been sent"), "success");
                        }, function(error) {
                            var messageError = "Your invitation hasn't been sent <br/>";
                            _.forOwn(error.data, function(v, k) {
                                for(var e = 0; e < v.length; e++) {
                                    messageError += v[e] + "<br/>";
                                }
                            });
                            cmNotify.message(gettextCatalog.getString(messageError), "error", true);
                        });
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
