/**
 * @ngdoc directive
 * @name message.directive:cmStatsMessage
 * @description Directive to list stats
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$routeParams
 * @requires https://docs.angularjs.org/api/ng/service/$timeout
 * @requires message.factory:apiMessage
 * @requires message.factory:apiAttachments
 * @requires _factory.factory:globalFunction
 * @requires _factory.factory:infiniteScrollFactory
 * @requires recipients.factory:recipientFilter
 * @requires _directives.directive:cmNotify
 * @requires moment
 */

(function () {
    'use strict';

    var statsMessage = function($routeParams, apiMessage, messageStats,
                                cmNotify, globalFunction, _, infiniteScrollFactory, $log,
                                recipientFilter, $timeout, moment) {
        return {
            templateUrl:'views/message/statsMessage.html',
            controller: function($scope) {
                /**
                 * Reset infiniteScrollFactory
                 */
                infiniteScrollFactory.nextElements = null;
                infiniteScrollFactory.isBusy = false;
                $scope.infinite = infiniteScrollFactory;
                /*
                 * Set the tabsmenu active
                 */
                 $scope.tabsMenu = {
                     active: 0
                 };

                 /**
                  * Get recipients filters
                  */
                 $scope.recipientFilterFirstPart = recipientFilter.getFirstPart();
                 $scope.recipientFilterSecondPart = recipientFilter.getSecondPart();

                 /**
                  * Init array with filter to passing in statusLegend directive
                  */
                 $scope.init = [];
                 $scope.init_second = [];

                 angular.forEach($scope.recipientFilterSecondPart, function(item) {
                     $scope.init_second.push(item.filter);
                 });

                 angular.forEach($scope.recipientFilterFirstPart, function(item) {
                     $scope.init.push(item.filter);
                 });
            },
            link: function(scope, element, attrs) {
                /**
                 * Init csv
                 */
                var csvUrl = null;
                /**
                 * Get url message with url and decode base64
                 */
                var getUrlMessage = atob($routeParams.url);
                var status;

                /**
                 * Load the message
                 */
                apiMessage.getOne(getUrlMessage).then(function(result) {
                    /**
                     * TODO Better with only scope.message = {};
                     * Init message
                     */
                    scope.sender_email = result.data.sender_email;
                    scope.sender_name = result.data.sender_name;
                    scope.subject = result.data.subject;
                    scope.message_name = result.data.name;
                    status = result.data.status;
                    /**
                     * Transform date for human
                     */
                    if(result.data.send_date !== null) {
                        scope.send_date = moment(result.data.send_date).format('LLL');
                    }
                    if(result.data.completion_date !== null) {
                        scope.completion_date = moment(result.data.completion_date).format('LLL');
                    }

                    /**
                     * Get category name
                     */
                    if(result.data.category !== null) {
                        scope.category_url = result.data.category;
                        apiMessage.getOne(result.data.category).then(function(result) {
                            scope.category = result.data.name;
                        });
                    }

                    /*
                     * TODO: inifite scroll
                     */

                    //Current page
                    scope.currentPage = 0;

                    scope.recipientsUrl = result.data._links.recipients.href;

                    //Get Mails
                    csvUrl = result.data._links.recipients.href + "?format=csv";
                    apiMessage.getOne(result.data._links.recipients.href, {
                        params: {
                            "page_size": 20,
                            "extra_fields": "tracking, delivery_status"
                        }
                    }).then(function(data) {
                        //data.results
                        scope.getMails = data.data.results;
                        if(!_.isNull(data.data.next)) {
                            infiniteScrollFactory.nextElements = data.data.next;
                        }
                    });

                    /**
                     * Get stats message
                     */
                    apiMessage.getOne(result.data._links.stats.href).then(function(result) {

                        var openRateValue = messageStats.rateValue(result.data, 'openRate');
                        var clickRateValue = messageStats.rateValue(result.data, 'clickRate');
                        var optOutRateValue = messageStats.rateValue(result.data, 'optOutRate');

                        scope.open = result.data.tracking.opened;
                        scope.delivered = result.data.last_status.delivered;

                        scope.trackings = result.data.tracking;

                        scope.filterGetLinkCliked = function(items) {
                            var result = {};
                            angular.forEach(items, function(value, key) {
                                if (key !== 'any') {
                                    result[key] = value;
                                }
                            });
                            return result;
                        };

                        scope.clicked = result.data.tracking.clicked.any;

                        scope.total = result.data.count.total;
                        scope.had_delay = result.data.count.had_delay;
                        scope.in_transit = result.data.count.in_transit;
                        scope.not_send = parseFloat(result.data.last_status.hardbounced) + parseFloat(result.data.last_status.ignored);

                        //Create a object Open Rate
                        scope.dataOpening = {
                            bgColor: "bg-blue",
                            value: openRateValue
                        };

                        scope.dataOptOut = {
                            bgColor: "bg-blue",
                            value: optOutRateValue
                        };

                        scope.dataClickRate = {
                            bgColor: "bg-blue",
                            value: clickRateValue
                        };

                        /**
                         * Optouts
                         */

                        scope.totalOptOut = result.data.optout.total;
                        scope.web = result.data.optout.web;
                        scope.mail = result.data.optout.mail;
                        scope.feedback_loop = result.data.optout["feedback-loop"];
                        scope.abuse = result.data.optout.abuse;
                        scope.bounce = result.data.optout.bounce;

                        var value = 0;
                        if(result.data.count.total !== 0) {
                            value = globalFunction.roundToTwo(result.data.last_status.delivered / result.data.count.total);
                        }
                        if(status === "sending") {
                            scope.statsSending = {
                                item1: {
                                    legend: "Nombres de mails transmis : " + result.data.last_status.delivered +"/"+ result.data.count.total,
                                    value: value
                                }
                            };
                        }

                    });

                    /**
                     * Mails bounced
                     */
                    if(result.data._links.opt_outs.href !== "undefined") {
                        apiMessage.getOne(result.data._links.opt_outs.href).then(function(result) {
                            scope.getOptout = result.data.results;
                        });
                    }

                });

                /**
                 * @ngdoc function
                 * @name showDetail
                 * @methodOf message.directive:cmStatsMessage
                 * @description
                 * Init showDetail
                 * @param {Object} mail mail selected by user
                 */
                scope.showDetail = function(mail) {
                    mail.detailOpen = !mail.detailOpen;
                    mail.status_log = {};
                    if(mail.detailOpen) {
                        apiMessage.getOne(mail._links.status_log.href).then(function(data_log) {
                            var mail_log = data_log.data.results;
                            $log.debug(data_log);
                            _.forOwn(mail_log, function(v, k) {
                                mail.status_log[v.status] = {
                                    "date": moment(v.creation_date).format('dddd DD MMMM YYYY'),
                                    "seconds": moment(v.creation_date).format('HH:mm:ss'),
                                    "raw_msg": v.raw_msg,
                                    "status": v.status
                                };
                            });

                        });
                    }
                    if(!_.isNull(mail.tracking)) {
                        mail.opened = {
                            "date": moment(mail.tracking.opened).format('dddd DD MMMM YYYY'),
                            "seconds": moment(mail.tracking.opened).format('HH:mm:ss')
                        };
                    }
                };

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmStatsMessage
                 * @name getStatsCsv
                 * @description
                 * Get csv statistics to display a download file for the user
                 */
                scope.getStatsCsv = function() {
                    apiMessage.getOne(csvUrl).then(function(result) {
                        var blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
                        var url = URL.createObjectURL(blob);
                        var dl = document.createElement('a');
                        dl.setAttribute('href', url);
                        dl.setAttribute('download', 'csv_' + moment().format('MMMM_Do_YYYY_h:mm:ss') + '.csv');
                        document.body.appendChild(dl);
                        dl.click();
                        document.body.removeChild(dl);
                    });
                };

                /**
                 * Disable infiniteScroll if others tabs active
                 */
                scope.$watch('tabsMenu.active', function() {
                    if(scope.tabsMenu.active !== 0) {
                        infiniteScrollFactory.isBusy = true;
                    }
                    else {
                        infiniteScrollFactory.isBusy = false;
                    }
                });

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmStatsMessage
                 * @name filterFct
                 * @description
                 * Callback function to filter by email delivery_status
                 */
                scope.filterFct = function(filterArray) {
                    apiMessage.getOne(scope.recipientsUrl, {
                        params: {
                            delivery_status: filterArray
                        }
                    }).then(function(data) {
                        scope.getMails = data.data.results;
                        if(!_.isNull(data.data.next)) {
                            infiniteScrollFactory.nextElements = data.data.next;
                        }else {
                            infiniteScrollFactory.nextElements = null;
                        }
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmStatsMessage
                 * @name filterFct
                 * @description
                 * Callback function to filter by email state
                 */
                scope.filterFct_second = function(filterArray) {
                    var params = {};
                    for (var i = 0; i < filterArray.length; i++) {
                        params[filterArray[i]] = "true";
                    }
                    apiMessage.getOne(scope.recipientsUrl, {
                        params: params
                    }).then(function(data) {
                        scope.getMails = data.data.results;
                        if(!_.isNull(data.data.next)) {
                            infiniteScrollFactory.nextElements = data.data.next;
                        }else {
                            infiniteScrollFactory.nextElements = null;
                        }
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmStatsMessage
                 * @name nextMails
                 * @description
                 * Get nextMails, infinite scroll function
                 */
                scope.nextMails = function() {
                    infiniteScrollFactory.getNextElements(scope.getMails);
                };
            }
        };
    };

    module.exports = statsMessage;

}());
