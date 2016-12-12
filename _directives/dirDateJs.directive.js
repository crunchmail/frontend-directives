/**
 * @ngdoc directive
 * @name _directives.directive:cmDirDateJs
 * @description
 * Convert a date
 * @restrict E
 * @scope
 * @param {Object} date Date to convert
 * @requires Lodash
 * @requires Moment
 */

(function () {
    'use strict';

    var directive = function(moment, _) {
        return {
            scope: {
                date: "="
            },
            restrict: "E",
            template: '{{dateConverted}}',
            link: function(scope, element, attrs) {
                if(!_.isNull(scope.date)) {
                    scope.dateConverted = moment(scope.date).format('LLL');
                }
            }
        };
    };

    module.exports = directive;

}());
