/**
 * @ngdoc directive
 * @name _directives.directive:cmConfirm
 * @author Yannick Huerre <dev@sheoak.fr>
 * @description
 * Show a confirmation message using angular native ng-dialog
 * @restrict A
 * @scope
 * @param {Function} ngClick Natif click angularJS
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires http://likeastore.github.io/ngDialog
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    String.prototype.interpolate = function (o) {
        return this.replace(/\${([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };

    var directive = function(ngDialog, $log, gettextCatalog) {
        return {
            priority: -1,
            restrict: 'A',
            scope: {
                ngClick: '&'
            },
            link: function(scope, element, attrs)
            {

                /**
                 * @ngdoc function
                 * @name showConfirm
                 * @methodOf _directives.directive:cmConfirm
                 * @description
                 * Open a dialog window, the user have the choice to validate or not.
                 */
                var showConfirm = function(e)
                {
                    // confirmation message
                    var message = attrs.cmConfirm;
                    if (message)
                    {
                        // prevent ngClick triggering
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        var translatedMessage = gettextCatalog.getString(message);

                        // Interpolate provided variables into translated message
                        if (attrs.cmConfirmData !== undefined) {
                            translatedMessage = translatedMessage.interpolate(JSON.parse(attrs.cmConfirmData));
                        }

                        // open dialog and run ngClick callback on resolve
                        return ngDialog.openConfirm({
                            template: 'views/_directives/confirm.html',
                            controller: function($scope) {
                                $scope.messageConfirm = translatedMessage;
                            },
                        }).then(scope.ngClick);
                    }
                };
                element.bind('click', showConfirm);
            }
        };
    };

    module.exports = directive;
}());
