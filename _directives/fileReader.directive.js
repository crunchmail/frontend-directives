/**
 * @ngdoc directive
 * @name _directives.directive:cmFileReader
 * @description
 * Read on load input file
 * @restrict A
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @scope
 * @param {Object} cmFileReader return file result
 * @param {Object} cmFileReaderType return file type
 */

(function () {
    'use strict';

    var directive = function($log) {
        return {
            restrict: "A",
            scope: {
                cmFileReader: "=",
                cmFileReaderType: "="
            },
            link: function(scope, element, attrs) {
                /**
                 * @ngdoc function
                 * @name change
                 * @methodOf _directives.directive:cmFileReader
                 * @description
                 * On change, load file
                 * @param {Event} changeEvent Passing the DOM event
                 */
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.cmFileReader = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                    scope.cmFileReaderType = changeEvent.target.files[0].type;
                });
            }
        };
    };

    module.exports = directive;

}());
