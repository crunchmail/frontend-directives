/**
 * @ngdoc directive
 * @name recipients.directive:cmRecipientsNode
 * @description
 * Recursive directive from recipientsTree
 * @requires recipients.factory:recipientsTreeHelper
 * @scope
 * @param {Object} value Passing zimbra contact format tree
 */
(function () {
    'use strict';

    var directive = function(recipientsTreeHelper) {
        return {
            templateUrl:'views/recipients/recipientsNode.html',
            scope: {
                "value": "="
            },
            require: '^cmRecipients',
            controller: function($scope, $element) {
                var ctrlRecipients = $element.controller("cmRecipients");

                /**
                 * @ngdoc function
                 * @name addContact
                 * @methodOf recipients.directive:cmRecipientsNode
                 * @description
                 * With cmRecipients controlller, we add a new recipient
                 */
                $scope.addContact = function(recipient) {
                    ctrlRecipients.addContact(recipient);
                    recipient.isHidden = true;
                };

                /**
                 * @ngdoc function
                 * @name addGroup
                 * @methodOf recipients.directive:cmRecipientsNode
                 * @description
                 * With cmRecipients controlller, we add a new addGroup
                 */
                $scope.addGroup = function(group) {
                    ctrlRecipients.addGroup(group);
                    group.isHidden = true;
                };
            },
            compile: function (element) {
                return recipientsTreeHelper.compile(element, this);
            }
        };

    };

    module.exports = directive;
}());
