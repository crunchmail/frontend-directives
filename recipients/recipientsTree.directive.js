/**
 * @ngdoc directive
 * @name recipients.directive:cmRecipientsTree
 * @description
 * Display recipients in the tree format
 * @scope
 * @param {Object} treeContact Passing Zimbra recipients
 * @param {Object} lists Zimbra distribution list
 */
(function () {
    'use strict';

    var directive = function() {
        return {
            templateUrl:'views/recipients/recipientsTree.html',
            scope: {
                "treeContact": "=",
                "lists": "="
            },
            require: '^cmRecipients',
            link: function(scope, element, attrs, ctrl) {
                /**
                 * @ngdoc function
                 * @name addDl
                 * @methodOf recipients.directive:cmRecipientsTree
                 * @description
                 * With cmRecipients controlller, we add a new distribution list
                 */
                scope.addDl = function(dl) {
                    ctrl.addDl(dl);
                };
            }
        };

    };

    module.exports = directive;
}());
