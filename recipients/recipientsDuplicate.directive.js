/**
 * @ngdoc directive
 * @name recipients.directive:cmRecipientsDuplicate
 * @description
 * Display to user a dialog with all duplicate recipients
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://github.com/likeastore/ngDialog
 * @requires Lodash
 * @scope
 * @param {Object} duplicate Passing the array with duplicate recipients
 * @param {Function} callback the callback function with recipients selected
 */
(function () {
    'use strict';

    var directive = function(_, $log, ngDialog) {
        return {
            templateUrl:'views/recipients/recipientsDuplicate.html',
            scope: {
                "duplicate": "=",
                "callback": "&"
            },
            link: function(scope, element, attr) {
                scope.limitDuplicate = 30;
                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipientsDuplicate
                 * @name showNext
                 * @description
                 * Get the next 20 recipients in duplicate
                 */
                scope.showNext = function() {
                    scope.limitDuplicate += 20;
                };

                scope.head = ["email"];

                _.forOwn(scope.duplicate[0].properties, function(v, k) {
                    scope.head.push(k);
                });

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipientsDuplicate
                 * @name passingSelected
                 * @description
                 * Get selected recipients and passing them into the callback
                 */
                scope.passingSelected = function() {
                    var selected = _.groupBy(scope.duplicate, "selected");
                    delete selected.true.selected;
                    scope.callback({ "arg" : selected.true });
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipientsDuplicate
                 * @name close
                 * @description
                 * Close all dialog
                 */
                scope.close = function(e) {
                    e.preventDefault();
                    ngDialog.closeAll();
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipientsDuplicate
                 * @name changeRadio
                 * @description
                 * Set all inputs radio value to false
                 */
                scope.changeRadio = function(contact) {
                    var inputRadios = document.querySelectorAll("input[name='radio-" + contact.to + "']");
                    for(var i = 0; i < inputRadios.length; i++) {
                        inputRadios[i].value = false;
                    }
                };

            }
        };

    };

    module.exports = directive;
}());
