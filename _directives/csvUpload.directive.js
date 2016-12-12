/**
 * @ngdoc directive
 * @name _directives.directive:cmCsvUpload
 * @description
 * Read csv file
 * @restrict E
 * @scope
 * @param {Object} csvResult Passing object csv result to parent
 * @param {Object} csvHeader Passing object csv header to parent
 * @param {Object} csvName Passing csv filename to parent
 * @param {Function} callback Callback function (optionnal)
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$timeout
 * @requires http://likeastore.github.io/ngDialog
 * @requires _directives.directive:cmNotify
 * @requires gettextCatalog
 */

(function () {
    'use strict';

    var directive = function($log, _, $rootScope, cmNotify, gettextCatalog, $timeout) {
        return {
            restrict: "E",
            scope: {
                csvResult: "=",
                csvHeader: "=",
                csvName: "=",
                callback: "&?"
            },
            template: [
                '<div class="importCsvContainer icon-file-upload">',
                    '<input class="btn" type="file" />',
                '</div>',
                '<div translate ng-show="csvSpinner">Contacts loading...</div>'
            ].join(''),
            link: function(scope, element, attrs) {
                var input = element.find("input");
                var mailRegexp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                var header = true;

                /**
                 * @ngdoc event
                 * @name change
                 * @eventOf _directives.directive:cmCsvUpload
                 * @description On change, parse the csv file with Papaparse
                 */
                input.bind("change", function(e) {
                    scope.csvHeader = [];
                    scope.csvResult = [];
                    header = true;
                    /**
                     * Show Spinner
                     */
                    scope.$apply(function () {
                        scope.csvSpinner = true;
                    });
                    if(_.isUndefined(e.target.files[0])) {
                        return;
                    }
                    /**
                     * Parsing
                     */
                    window.Papa.parse(e.target.files[0], {
                        skipEmptyLines: true,
                        dynamicTyping: true,
                        header: true,
                        encoding: 'UTF-8',
                        complete: function(results, $files, err) {
                            $log.debug("complete");
                            $log.debug(results);
                            /**
                             * Set the csv name
                             */
                            scope.csvName = e.target.files[0].name;
                            var metas = results.meta.fields;
                            for(var m = 0; m < metas.length; m++) {
                                if(mailRegexp.test(metas[m])) {
                                    header = false;
                                }
                            }
                            /**
                             * Check if we have a header
                             */
                            if(!header) {
                                scope.$apply(function () {
                                    scope.csvSpinner = false;
                                });
                                cmNotify.message(gettextCatalog.getString("Your file has no header"), "error", true);
                                return;
                            }else {
                                scope.csvHeader = results.meta.fields;
                            }
                            /*
                             * Clean input
                             */
                            input[0].value = "";
                            scope.$apply(function () {
                                scope.csvResult = results.data;
                                scope.csvSpinner = false;
                                if(!_.isUndefined(scope.callback)) {
                                    $timeout(function() {
                                        scope.callback();
                                    });
                                }
                            });
                            if (err) {
                                console.log('err ', err);
                            }
                        }
                    });
                });
            }
        };
    };

    module.exports = directive;

}());
