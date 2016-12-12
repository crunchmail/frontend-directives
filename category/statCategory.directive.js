/**
 * @ngdoc directive
 * @name category.directive:cmStatCategory
 * @description
 * A directive to display the category statistics
 * @requires https://docs.angularjs.org/api/ng/service/$routeParams
 * @requires gettextCatalog
 * @requires category.factory:apiCategory
 * @requires _factory.factory:globalFunction
 * @requires category.directive:messageStats
 */
(function () {
    'use strict';

    var directive = function(apiCategory, $routeParams, gettextCatalog,
        globalFunction, messageStats) {
        return {
            templateUrl:'views/category/statCategory.html',
            controller: function($scope) {
                /*
                 * Set the tabsmenu active
                 */
                 $scope.tabsMenu = {
                     active: 0
                 };
            },
            link: function(scope, element, attrs) {
                // Get Messages
                var getUrlCat = atob($routeParams.url);
                var promises = [];
                var promisesStats = [];
                var openRateValue;
                var clickRateValue;
                var optOutRateValue;
                var maxYLabel;
                var dataline = {
                    xlabel:[],
                    lines:[],
                    legend:[]
                };

                //Order important
                dataline.legend.push(gettextCatalog.getString('Open rate'));
                dataline.legend.push(gettextCatalog.getString('Click rate'));
                dataline.legend.push(gettextCatalog.getString('Optout rate'));

                /**
                 * Get category object from API
                 */
                apiCategory.getOne(getUrlCat).then(function(data) {
                    data = data.data;
                    scope.title = data.name;
                    //url messages stats
                    var messages_stats = data._links.messages_stats.href;

                    //url Optout
                    var optout_url = data._links.opt_outs.href;

                    //url all stats
                    var category_stats = data._links.stats.href;

                    /**
                     * Get category statistics
                     */
                    apiCategory.getOne(category_stats).then(function(dataCategoryStats) {
                        dataCategoryStats = dataCategoryStats.data;

                        //Open stats and mails
                        scope.delivered = dataCategoryStats.last_status.delivered;

                        scope.total = dataCategoryStats.count.total;
                        scope.had_delay = dataCategoryStats.count.had_delay;
                        scope.in_transit = dataCategoryStats.count.in_transit;
                        scope.not_send = parseFloat(dataCategoryStats.last_status.hardbounced) + parseFloat(dataCategoryStats.last_status.ignored);

                        //Optout Stats
                        scope.totalOptOut = dataCategoryStats.optout.total;
                        scope.web = dataCategoryStats.optout.web;
                        scope.mail = dataCategoryStats.optout.mail;
                        scope.feedback_loop = dataCategoryStats.optout["feedback-loop"];
                        scope.abuse = dataCategoryStats.optout.abuse;

                        //Delivery
                        var deliveryMedian = globalFunction.convertTiming(dataCategoryStats.timing.delivery_median);
                        scope.deliveryMedian = deliveryMedian;

                    });

                    /**
                     * Get message statistics
                     */
                    apiCategory.getOne(messages_stats).then(function(dataMessagesStats) {
                        var arrOpenRateValue = [];
                        var arrClickRateValue = [];
                        var arrOptOutValue = [];
                        var arrNameMessage = [];
                        dataMessagesStats = dataMessagesStats.data;
                        scope.getMessages = dataMessagesStats;

                        for(var i in dataMessagesStats) {
                            if(typeof dataMessagesStats[i] === 'object' && dataMessagesStats[i] !== null) {
                                var nameMessage = dataMessagesStats[i].name;
                                var dataStat = dataMessagesStats[i].stats;
                                var openRateValue = globalFunction.convertPercent(messageStats.rateValue(dataStat, 'openRate'), 1);
                                var clickRateValue =  globalFunction.convertPercent(messageStats.rateValue(dataStat, 'clickRate'), 1);
                                var optOutRateValue =  globalFunction.convertPercent(messageStats.rateValue(dataStat, 'optOutRate'), 1);

                                arrOpenRateValue.push(openRateValue);
                                arrClickRateValue.push(clickRateValue);
                                arrOptOutValue.push(optOutRateValue);

                                dataline.xlabel.push(nameMessage);
                            }
                        }
                        dataline.lines.push(arrOpenRateValue);
                        dataline.lines.push(arrClickRateValue);
                        dataline.lines.push(arrOptOutValue);

                        scope.data = dataline;
                        document.querySelector('.spinner').classList.remove('spinner');
                    });

                    /**
                     * Get category opt out
                     */
                    apiCategory.getOne(optout_url).then(function(dataOptout) {
                        scope.getOptout = dataOptout.data.results;
                    });
                });
            }
        };
    };

    module.exports = directive;
}());
