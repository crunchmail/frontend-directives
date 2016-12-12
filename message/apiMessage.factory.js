/**
 * @ngdoc service
 * @name message.factory:apiMessage
 * @description message factory
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires messageStats.factory:messageStats
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var factory = function($http, messageStats, $rootScope, $log, gettextCatalog){
        return {
            /**
             * @ngdoc property
             * @name urlTpl
             * @propertyOf message.factory:apiMessage
             * @description save the template url
             */
            urlTpl:"",
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name getAll
             * @param {Object} config passing some params to $http request
             * @description get all messages
             */
            getAll: function(config) {
                return $http.get($rootScope.messages, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name getOne
             * @param {Object} url message url
             * @param {Object} config passing some params to $http request
             * @description get one message
             */
            getOne: function(url, config) {
                return $http.get(url, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name sendMessage
             * @param {Object} url message url
             * @param {Object} config passing some params to $http request
             * @description send a message
             */
            sendMessage: function(url, config) {
                return $http.patch(url, {"status": "sending"}, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name sendTestMessage
             * @param {Object} url message url
             * @param {Array} list recipients list
             * @param {Object} config passing some params to $http request
             * @description send a test message
             */
            sendTestMessage: function(url, list, config) {
                return $http.post(url + "preview_send/", { "to" : list }, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name createMessage
             * @param {Object} data message data to update
             * @param {Object} config passing some params to $http request
             * @description create a message
             */
            createMessage: function(data, config) {
                return $http.post($rootScope.messages, data, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name updateMessage
             * @param {Object} url message url
             * @param {Object} data message data to update
             * @param {Object} config passing some params to $http request
             * @description update a message
             */
            updateMessage: function(url, data, config) {
                return $http.patch(url, data, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name deleteMessage
             * @param {String} url message url to delete
             * @param {Object} config passing some params to $http request
             * @description delete a message
             */
            deleteMessage: function(url, config) {
                return $http.delete(url, config);
            },
            /**
             * @ngdoc method
             * @methodOf message.factory:apiMessage
             * @name getStats
             * @param {Object} item message object
             * @description get stats from message and create object with data, open rate, click rate and optout rate
             */
            getStats: function(item) {
                this.getOne(item._links.stats.href).then(function(result) {
                    var openRateValue = messageStats.rateValue(result.data, 'openRate');
                    var clickRateValue = messageStats.rateValue(result.data, 'clickRate');
                    var optOutRateValue = messageStats.rateValue(result.data, 'optOutRate');
                    item.dataProgress = {
                        openRate: {
                            legend: gettextCatalog.getString("Open rate"),
                            value: openRateValue
                        },
                        clickRate: {
                            legend: gettextCatalog.getString("Click rate"),
                            value: clickRateValue
                        },
                        optOutRate: {
                            legend: gettextCatalog.getString("Optout rate"),
                            value: optOutRateValue
                        }
                    };
                });
            }
        };
    };

    module.exports = factory;
}());
