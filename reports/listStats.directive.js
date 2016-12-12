/**
 * @ngdoc directive
 * @name listStats.directive:cmListStats
 * @description
 * Directive to list stats
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires message.factory:apiMessage
 * @requires _factory.factory:infiniteScrollFactory
 * @requires gettextCatalog
 * @requires Lodash
 */

(function () {
    'use strict';

    var directive = function(apiMessage, gettextCatalog,
        $rootScope, infiniteScrollFactory, _, $log) {
        return {
            templateUrl:'views/reports/liststats.html',
            link: function(scope, element, attrs) {
                scope.countpager = 50;
                infiniteScrollFactory.nextElements = null;
                infiniteScrollFactory.isBusy = false;
                scope.infinite = infiniteScrollFactory;

                /**
                 * @ngdoc property
                 * @name reportFilters
                 * @methodOf listStats.directive:cmListStats
                 * @description
                 * Init array to filter report
                 */
                scope.reportFilters = [
                    {
                        "name": gettextCatalog.getString("Sending"),
                        "value": "status=sending",
                        "filter": "sending"
                    },
                    {
                        "name": gettextCatalog.getString("Sent"),
                        "value": "status=sent",
                        "filter": "sent"
                    }
                ];

                /**
                 * init status
                 */
                scope.init = ["sent", "sending"];

                apiMessage.getAll({
                    params : {
                        "status": scope.init,
                        "page_size": scope.countpager
                    }
                }).then(function(result) {
                    scope.getMessages = result.data.results;
                    scope.count = result.data.count;
                    scope.url = $rootScope.messages;

                    if(!_.isNull(result.data.next)) {
                        infiniteScrollFactory.nextElements = result.data.next;
                    }

                    scope.callback(result.data.results);

                });

                /**
                 * @ngdoc function
                 * @name getMoreMessages
                 * @methodOf listStats.directive:cmListStats
                 * @description
                 * Infinite Function to get more messages
                 */
                scope.getMoreMessages = function() {
                    infiniteScrollFactory.getNextElements(scope.getMessages, function(item) {
                        apiMessage.getStats(item);
                    });
                };

                /**
                 * @ngdoc function
                 * @name filterFct
                 * @methodOf listStats.directive:cmListStats
                 * @param {Array} filterArray array with filters from statusLegend.directive.js
                 * @description
                 * Apply filter function
                 */
                scope.filterFct = function(filterArray) {
                    /**
                     * Get all message
                     */
                    apiMessage.getAll({
                        params: {
                            "status": filterArray,
                            "page_size": scope.countpager
                        }
                    }).then(function(result) {
                        /**
                         * Set total scope to activate/deactivate infinite scroll
                         */
                        scope.total = result.data.count;
                        /**
                         * Return getMessages array to display it
                         */
                        scope.getMessages = result.data.results;
                        /**
                         * Set the next url to infinite scroll
                         */
                        infiniteScrollFactory.nextElements = result.data.next;
                        /**
                         * Callback Function
                         */
                        scope.callback(result.data.results);

                    });
                };

                /**
                 * @ngdoc function
                 * @name callback
                 * @methodOf listStats.directive:cmListStats
                 * @param {Object} data promise result with all messages
                 * @description
                 * Callback Function to set name category
                 */
                scope.callback = function(data) {
                    _.forOwn(data, function(v, k) {
                        apiMessage.getStats(v);
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
