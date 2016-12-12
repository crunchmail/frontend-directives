/**
 * @ngdoc directive
 * @name message.directive:cmListMessage
 * @restrict E
 * @description Directive to list message
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires _factory.factory:cmNotify
 * @requires _factory.factory:infiniteScrollFactory
 * @requires message.factory:cmListMessage
 * @requires message.factory:messageFilter
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$routeParams
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires gettextCatalog
 */

(function () {
    'use strict';

    var directive = function(apiMessage, $routeParams,
                               $http, apiCategory, $log, _,
                               infiniteScrollFactory, messageFilter, $rootScope, cmNotify,
                               gettextCatalog) {
        return {
            templateUrl:'views/message/listMessage.html',
            restrict: "E",
            link: function(scope, element, attrs) {
                /**
                 * Get Status by url
                 */
                var status = $routeParams.status;
                /**
                 * Init a empty arary for name categories
                 */
                var categoriesArr = [];
                /**
                 * Reset infiniteScrollFactory
                 */
                infiniteScrollFactory.nextElements = null;
                infiniteScrollFactory.isBusy = false;

                /**
                 * Passing infiniteScrollFactory data into directive scope
                 */
                scope.infinite = infiniteScrollFactory;

                /**
                 * @ngdoc property
                 * @name messageFilter
                 * @propertyOf message.directive:cmListMessage
                 * @description Get filter to passing to cmStatusLegend
                 */
                scope.messageFilter = messageFilter.get();

                /**
                 * @ngdoc property
                 * @name init
                 * @propertyOf message.directive:cmListMessage
                 * @description Init status. Sent, sending, message_ok and message_issues
                 */
                scope.init = ["sent", "sending", "message_ok", "message_issues"];

                /**
                 * @ngdoc property
                 * @name size
                 * @propertyOf message.directive:cmListMessage
                 * @description Init number of message to display. Default: 25.
                 */
                scope.size = 25;

                /**
                 * Check status url and reset init status array with new value
                 */
                $log.debug(status);
                if(status !== "all") {
                    scope.init = [];
                    scope.init.push(status);
                }

                /**
                 * Init params object to passing to api call
                 */
                var params = {
                    "page_size": scope.size,
                    "status": scope.init
                };

                /**
                 * Get all categories...
                 */
                apiCategory.getAll().then(function(cat) {
                    _.forOwn(cat.data.results, function(v, k) {
                        categoriesArr[v.url] = v;
                    });
                    /**
                     * ...then, get all messages
                     */
                    apiMessage.getAll({
                        /**
                         * Passing status params
                         */
                        params: params
                    }).then(function(result) {
                        $log.debug("result listing message");
                        /**
                         * Set totalMessage to activate/deactivate infinite scroll
                         */
                        scope.totalMessage = result.data.count;
                        /**
                         * Create getMessages array with all messages
                         */
                        scope.getMessages = result.data.results;

                        /**
                         * Set the next url for infinite scroll to get more messages
                         */
                        if(!_.isNull(result.data.next)) {
                            infiniteScrollFactory.nextElements = result.data.next;
                        }

                        /**
                         * Callback function to access name category
                         */
                        scope.callback(result.data.results);

                        $rootScope.$broadcast('hideSpinner');
                    });
                });

                /**
                 * @ngdoc function
                 * @name callback
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Callback Function to set name category
                 * @param {Object} data promise result with all messages
                 */
                scope.callback = function(data) {
                    _.forOwn(data, function(v, k) {
                        if(!_.isNull(v.category)) {
                            v.categoryName = categoriesArr[v.category].name;
                        }
                    });
                };

                /**
                 * @ngdoc function
                 * @name archiveMessage
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Archive Function
                 * @param {String} url api url
                 */
                scope.archiveMessage = function(url) {
                    console.log(url);
                };

                /**
                 * @ngdoc function
                 * @name deleteMessage
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Delete a message
                 * @param {String} url api url
                 * @param {String} idx array index of getMessages
                 */
                scope.deleteMessage = function(url, idx) {
                    apiMessage.deleteMessage(url).then(function(result) {
                        cmNotify.message(gettextCatalog.getString('Your message has been deleted'), "success");
                        scope.getMessages.splice(idx, 1);
                    }, function(){
                        cmNotify.message(gettextCatalog.getString("Your message has not been deleted"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name duplicateMessage
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Duplicate a message
                 * @param {String} url api url, get message url
                 * @param {String} idx array index of getMessage to insert duplicate message
                 */
                scope.duplicateMessage = function(url, idx) {
                    apiMessage.getOne(url).then(function(result) {
                        /**
                         * Stock id message to ask api document if we have a tpl with this message
                         */
                        var idMessage = result.data.id;
                        /**
                         * Create duplicate object
                         */
                        var duplicatedMessage = result.data;
                        duplicatedMessage.links = {};
                        duplicatedMessage.url = "";
                        duplicatedMessage.status = "message_ok";
                        duplicatedMessage.name = duplicatedMessage.name + " - copy";
                        duplicatedMessage.subject = duplicatedMessage.subject + " - copy";

                        /**
                         * Create a new message
                         */
                        apiMessage.createMessage(duplicatedMessage).then(function(message) {
                            /**
                             * Notify the user
                             */
                            cmNotify.message(gettextCatalog.getString('Your message has been duplicated'), "success");
                            message.data.categoryName = categoriesArr[message.data.category].name;
                            /**
                             * Insert our new message duplicate in message list
                             */
                            scope.getMessages.splice(idx + 1, 0, message.data);
                            /**
                             * Ask to document api if have a tpl with our message
                             */
                            $http.get($rootScope.tplStore + "documents/", {
                                params: {
                                    message: idMessage
                                }
                            }).then(function(tpl) {
                                /**
                                 * Check if we have a uniq tpl
                                 */
                                if(tpl.data.results.length === 1) {
                                    $log.debug("Found a tpl");
                                    /**
                                     * Create our new document
                                     */
                                    var duplicatedTpl = tpl.data.results[0];
                                    duplicatedTpl.url = "";
                                    duplicatedTpl.message = message.data.url;
                                    /**
                                     * Post to api our new message
                                     */
                                    $http.post($rootScope.tplStore + "documents/", duplicatedTpl);
                                }else if (tpl.data.results.length > 1){
                                    /**
                                     * TODO Duplicate tpl to same message
                                     */
                                    $log.debug("Multiple tpl to duplicates");
                                }else {
                                    $log.debug("No tpl found");
                                }
                            });
                        });
                    });
                };

                /**
                 * @ngdoc function
                 * @name filterFct
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Apply filter function
                 * @param {Array} filterArray array with filters from statusLegend.directive.js
                 */
                scope.filterFct = function(filterArray) {
                    /**
                     * Get all message
                     */
                    apiMessage.getAll({
                        params: {
                            "status": filterArray,
                            "page_size": scope.size
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
                 * @name getMoreMessages
                 * @methodOf message.directive:cmListMessage
                 * @description
                 * Infinite Function to get more messages
                */
                scope.getMoreMessages = function() {
                    $log.debug("get More messages");
                    infiniteScrollFactory.getNextElements(scope.getMessages, function(item) {
                        if(!_.isNull(item.category)) {
                            item.categoryName = categoriesArr[item.category].name;
                        }
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
