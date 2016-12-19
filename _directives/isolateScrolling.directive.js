/**
 * @ngdoc directive
 * @name _directives.directive:cmIsolateScrolling
 * @description
 * Bind event scroll on element
 * @restrict A
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 */


(function () {
    'use strict';

    var directive = function(_, $log) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                /**
                 * @ngdoc function
                 * @name DOMMouseScroll
                 * @methodOf _directives.directive:cmIsolateScrolling
                 * @description
                 * Bind Scroll on element
                 * @param {Event} e Passing the DOM event
                 */
                element.bind('DOMMouseScroll', function (e) {
                    if (e.detail > 0 && this.clientHeight + this.scrollTop === this.scrollHeight) {
                        this.scrollTop = this.scrollHeight - this.clientHeight;
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }
                    else if (e.detail < 0 && this.scrollTop <= 0) {
                        this.scrollTop = 0;
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }
                });
                /**
                 * @ngdoc function
                 * @name mousewheel
                 * @methodOf _directives.directive:cmIsolateScrolling
                 * @description
                 * Bind Scroll on element
                 * @param {Event} e Passing the DOM event
                 */
                element.bind('mousewheel', function (e) {
                    if (e.deltaY > 0 && this.clientHeight + this.scrollTop >= this.scrollHeight) {
                        this.scrollTop = this.scrollHeight - this.clientHeight;
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }
                    else if (e.deltaY < 0 && this.scrollTop <= 0) {
                        this.scrollTop = 0;
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }

                    return true;
                });
            }
        };

    };

    module.exports = directive;
}());
