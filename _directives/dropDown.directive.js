/**
 * @ngdoc directive
 * @name _directives.directive:cmDropDown
 * @description
 * DropDown directive
 * @restrict E
 * @requires https://docs.angularjs.org/api/ng/service/$document
 * @requires https://docs.angularjs.org/api/ng/service/$log
 */

(function () {
    'use strict';
    var dropDown = function($document, $log) {
        return {
            transclude: true,
            template: '<div class="dropDownMenu" ng-transclude></div>',
            link: function(scope, element, attrs) {

                /**
                 * @ngdoc function
                 * @name hideMenu
                 * @methodOf _directives.directive:cmDropDown
                 * @param {Object} e Passing DOM click event
                 * @description
                 * Hide all others menus
                 */
                var hideMenu = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    // remove myself
                    $document.off('click');

                    // hide all menus
                    var menu = document.querySelectorAll('.dropDownMenu ul.isVisible');
                    angular.forEach(menu , function (el) {
                        if(e.target.nextElementSibling !== el) {
                            el.classList.remove('isVisible');
                        }
                    });
                };

                /**
                 * @ngdoc function
                 * @name initMenu
                 * @methodOf _directives.directive:cmDropDown
                 * @description
                 * Add a document event
                 */
                var initMenu = function()
                {
                    $document.on('click', function(event) {
                        hideMenu(event);
                    });
                };

                /**
                 * @ngdoc event
                 * @name initMenu
                 * @eventOf _directives.directive:cmDropDown
                 * @description
                 * Event on destroy, remove event click on $document
                 */
                scope.$on('$destroy', function(event, data) {
                    $document.off('click');
                });

                /**
                 * @ngdoc function
                 * @name showMenuDropDown
                 * @methodOf _directives.directive:cmDropDown
                 * @param {Object} e Passing DOM click event
                 * @description
                 * Show the menu
                 */
                scope.showMenuDropDown = function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    // close all others
                    hideMenu(e);

                    angular.element(e.target.nextElementSibling).toggleClass("isVisible");

                    // the body listenner is created on click, to avoid
                    // multiple calls
                    initMenu();
                };

            }
        };
    };

    module.exports = dropDown;

}());
