/**
 * @ngdoc directive
 * @name _directives.directive:cmCollapse
 * @description
 * Collapse directive with title and content. On click on title, display content.
 * @restrict E
 */
(function () {
    'use strict';

    var directive = function() {
        return {
            restrict: "A",
            link: function($scope, element, attrs) {
                element.addClass('collapse');
                var title = element.find('h3');
                var content = element[0].querySelector('.collapse-content');
                content.classList.add('collapsed');

                /**
                 * @ngdoc event
                 * @eventOf _directives.directive:cmCollapse
                 * @description
                 * Show the content with changing class
                 */
                title.on('click', function(e) {
                    angular.element(this).toggleClass('active');
                    content.classList.toggle('collapsed');
                });
            }
        };
    };

    module.exports = directive;

}());
