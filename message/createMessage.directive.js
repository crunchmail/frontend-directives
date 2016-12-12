/**
 * @ngdoc directive
 * @name message.directive:cmCreateMessage
 * @description Directive for the first message to create
 * @restrict E
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires _factory.factory:cmNotify
 * @requires message.factory:apiMessage
 * @requires https://docs.angularjs.org/api/ng/service/$sce
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires _factory.factory:base64
 * @requires _directives.factory:globalFunction
 * @requires _factory.factory:tokenHandler
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(_, $log, apiMessage, tokenHandler, appSettings,
                             $sce, $rootScope, createMessageFactory, cmNotify,
                             gettextCatalog, $http, $location, base64) {
        return {
            templateUrl:'views/message/createMessage.html',
            controller: function($scope) {
                /**
                 * @ngdoc property
                 * @name message
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Initialize message object and set track_open and track_clicks
                 */
                $scope.message = {
                    "track_open": true,
                    "track_clicks": true
                };
            },
            link: function(scope, element, attrs) {
                /**
                 * @ngdoc property
                 * @name messageUrl
                 * @propertyOf message.directive:cmCreateMessage
                 * @description To save the message url
                 */
                var messageUrl;
                /**
                 * @ngdoc property
                 * @name next
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Load next messages
                 */
                scope.next = null;

                /**
                 * @ngdoc property
                 * @name next
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Global variable to set form validity and show the new button to access to Toothpaste
                 */
                $rootScope.formValid = true;

                /**
                 * @ngdoc property
                 * @name duplicateVisible
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Boolean to show/hide the duplicate view
                 */
                scope.duplicateVisible = false;

                /**
                 * @ngdoc property
                 * @name typeMessage
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Set the message type, default: news-message
                 */
                scope.typeMessage = "news-message";

                /**
                 * @ngdoc property
                 * @name disabledBtn
                 * @propertyOf message.directive:cmCreateMessage
                 * @description disable quick send tab, default: disabled
                 */
                scope.disabledBtn = true;

                /**
                 * @ngdoc property
                 * @name detailMessage
                 * @propertyOf message.directive:cmCreateMessage
                 * @description Show some message if not domain, not categories...
                 */
                $rootScope.detailMessage = false;

                /**
                 * @ngdoc function
                 * @name changeTypeMessage
                 * @param {String} type Message type
                 * @methodOf message.directive:cmCreateMessage
                 * @description Show some message if not domain, not categories...
                 */
                scope.changeTypeMessage = function(type) {
                    scope.typeMessage = type;
                    scope.duplicateVisible = false;
                };

                /**
                 * @ngdoc function
                 * @name $watch message object
                 * @methodOf message.directive:cmCreateMessage
                 * @description Check name, sender_email, sender_name, subject and category to validate or not the form
                 */
                scope.$watch("message", function(n, o) {
                    if(_.has(n, "name") && _.has(n, "sender_email") && _.has(n, "sender_name") && _.has(n, "subject") && _.has(n, "category")) {
                        $rootScope.formValid = false;
                    }
                }, true);

                /**
                 * @ngdoc function
                 * @name apiMessage.getAll
                 * @param {Object} params $http params
                 * @methodOf message.directive:cmCreateMessage
                 * @description Get all message see {@link message.factory:apiMessage}
                 */
                apiMessage.getAll(
                    {
                        params: {
                            "page_size": 15
                        }
                    }
                ).then(function(result) {
                    scope.listMessage = result.data.results;
                    scope.totalMessage = result.data.count;
                    scope.next = result.data.next;
                    if(_.isNull(result.data.next)) {
                        scope.disabledBtnNext = true;
                    }
                });

                /**
                 * @ngdoc function
                 * @name openEditor
                 * @param {String} name get the name to set document name in Toothpaste
                 * @methodOf message.directive:cmCreateMessage
                 * @description Open editor Toothpaste and pass in query args a token, api url and the name
                 */
                function openEditor(name) {
                    var newToken = tokenHandler.getToken();
                    var urlIframe = appSettings.urlEditeur + "?r=" + (new Date()).getTime() + "&apiUrl=" + appSettings.apiUrl + "&token=" + newToken + "&nameTpl=" + name;
                    if(!_.isUndefined(messageUrl)) {
                        urlIframe += "&urlMessage=" + messageUrl;
                    }

                    $rootScope.urlEditeur = $sce.trustAsResourceUrl(urlIframe);

                    $rootScope.editeurVisible = true;

                    $rootScope.hideBody  = 'overflowHideBody iconOnly';
                }

                /**
                 * @ngdoc function
                 * @name showEditor
                 * @methodOf message.directive:cmCreateMessage
                 * @description Create the message and open Toothpaste
                 */
                scope.showEditor = function() {
                    var form = createMessageFactory.getForm();
                    /*
                     * Post message
                     */
                    var messageToPost = _.clone(scope.message);
                    messageToPost.html = createMessageFactory.initHtmlMessage;
                    messageToPost.category = messageToPost.category.url;

                    /*
                     * set Form createMessage dirty to false
                     */
                    form.$setPristine();
                    /*
                     * Open editor
                     */
                    if(!_.isUndefined(messageUrl)) {
                        openEditor(messageToPost.name);
                    }else {
                        apiMessage.createMessage(messageToPost).then(function(result) {
                            $log.debug(result);
                            messageUrl = result.data.url;
                            openEditor(messageToPost.name);
                        });
                    }
                };

                /**
                 * @ngdoc function
                 * @name showEditor
                 * @param {Object} message Message object
                 * @methodOf message.directive:cmCreateMessage
                 * @description Duplicate the selected message
                 */
                scope.duplicateMessage = function(message) {
                    /**
                     * Stock id message to ask api document if we have a tpl with this message
                     */
                    var idMessage = message.id;
                    /**
                     * Create duplicate object
                     */
                    var duplicatedMessage = message;
                    duplicatedMessage.links = {};
                    duplicatedMessage.url = "";
                    duplicatedMessage.status = "message_ok";
                    duplicatedMessage.name = duplicatedMessage.name + " - copy";
                    duplicatedMessage.subject = duplicatedMessage.subject + " - copy";

                    /**
                     * Create a new message
                     */
                    apiMessage.createMessage(duplicatedMessage).then(function(messageCreated) {
                        /**
                         * Notify the user
                         */
                        cmNotify.message(gettextCatalog.getString('Your message has been duplicated'), "success");
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

                            /**
                             * Redirect user to detailmessage
                             */
                            $location.path("/detailmessage/" + base64.encode(messageCreated.data.url));
                        });
                    });
                };

                /**
                 * @ngdoc function
                 * @name moreMessages
                 * @methodOf message.directive:cmCreateMessage
                 * @description Get the next messages
                 */
                scope.moreMessages = function() {
                    $log.debug(scope.next);
                    if(!_.isNull(scope.next)) {
                        apiMessage.getOne(scope.next).then(function(result) {
                            scope.next = result.data.next;
                            scope.listMessage = scope.listMessage.concat(result.data.results);
                            if(result.data.next === "null") {
                                scope.disabledBtnNext = true;
                            }
                        });
                    }

                };
            }
        };
    };

    module.exports = directive;
}());
