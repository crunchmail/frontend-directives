/**
 * @ngdoc directive
 * @name _directives.directive:cmPosSticky
 * @description
 * Bind scroll to add sticky postion on element`
 * @restrict A
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function($log, $window){
        return {
            restrict: 'A',
            scope: {
                "active": "="
            },
            link: function(scope, element, attrs){
                var el = angular.element(element);
                scope.$watch("active", function(n, o) {
                    if(n === 0) {
                        /**
                         * @ngdoc function
                         * @name scroll
                         * @methodOf _directives.directive:cmPosSticky
                         * @description
                         * Bind scroll event on window
                         */
                        angular.element($window).on("scroll", function() {
                            var posP = el.parent()[0].getBoundingClientRect();
                            var posE = el[0].getBoundingClientRect();
                            if(posP.top + 45 <= 0) {
                                el.addClass("pos_sticky");
                            }else {
                                el.removeClass("pos_sticky");
                            }
                        });
                    }else {
                        angular.element($window).off("scroll");
                        el.removeClass("pos_sticky");
                    }
                });

            }
        };
    };

    module.exports = directive;

}());
