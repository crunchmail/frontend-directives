/**
 * @ngdoc directive
 * @name _directives.directive:cmDynamic
 * @description
 * Compile html and return it
 * @restrict A
 * @requires https://docs.angularjs.org/api/ng/service/$compile
 */

(function () {
    'use strict';
    var directive = function($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function(scope, element, attrs) {
                scope.$watch(attrs.cmDynamic, function(html) {
                    if(html !== " ") {
                        element.html(html);
                        $compile(element.contents())(scope);
                    }
                });
            }
        };
    };

    module.exports = directive;
}());
