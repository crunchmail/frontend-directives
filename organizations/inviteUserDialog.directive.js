/**
 * @ngdoc directive
 * @name organizations.directive:cmInviteUserDialog
 * @description
 * A directive to invite a user in an organization
 */
(function () {
    'use strict';

    var directive = function() {
        return {
            templateUrl:'views/organizations/inviteUserDialog.html',
            controller: function($scope) {
                $scope.guessUser = {};
                /**
                 * @ngdoc function
                 * @name inviteUser
                 * @methodOf organizations.directive:cmInviteUserDialog
                 * @description
                 * Return a object guessUser which contain data for invite a new user
                 */
                $scope.inviteUser = function() {
                    $scope.confirm($scope.guessUser);
                };
            }
        };
    };

    module.exports = directive;

}());
