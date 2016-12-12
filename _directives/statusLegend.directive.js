/**
 * @ngdoc directive
 * @name statusLegend.directive:cmStatusLegend
 * @restrict E
 * @scope
 * @param {Object} filtersData all filters
 * @param {Function} filterFct filter message call in directive parent
 * @param {Array} init filter array to init model
 * @param {Bool} activateDisabled always keep a item selected, use for listStats, to avoid listing all messages with empty params request
 */

(function () {
    'use strict';

    var directive = function($log, apiMessage, infiniteScrollFactory, _){
        return {
            restrict: 'E',
            scope: {
                "filtersData": "=",
                "filterFct": "&",
                "init": "=",
                "activateDisabled": "="
            },
            templateUrl: 'views/_directives/statusLegend.html',
            link: function(scope, element, attrs){
                /**
                 * Init Variable allStatus
                 * Get data from messageFilter.factory.js for example, or directly into directive
                 */
                scope.filtersStatus = scope.filtersData;

                /**
                 * @ngdoc function
                 * @name applyFilter
                 * @methodOf statusLegend.directive:cmStatusLegend
                 * @description
                 * Get values checkbox
                 *
                 * Documentation de checklist-model {@link https://github.com/vitalets/checklist-model}
                 */
                scope.applyFilter = function() {
                    infiniteScrollFactory.isBusy = false;
                     /**
                      * @ngdoc function
                      * @name filterFct
                      * @param {Array} init array with status to filter messages
                      * @methodOf statusLegend.directive:cmStatusLegend
                      * @description
                      * Apply filter to get messages with multi $http params
                      */
                    scope.filterFct({filterArray: scope.init});
                };
            }
        };
    };

    module.exports = directive;

}());
