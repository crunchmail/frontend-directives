/**
 * @ngdoc directive
 * @name message.directive:cmMessageDetails
 * @description Directive to create a message
 * @restrict E
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$routeParams
 * @requires https://docs.angularjs.org/api/ng/service/$compile
 * @requires https://docs.angularjs.org/api/ng/service/$sce
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$timeout
 * @requires http://likeastore.github.io/ngDialog
 * @requires message.factory:apiMessage
 * @requires message.factory:apiAttachments
 * @requires message.factory:createMessageFactory
 * @requires domain.factory:apiDomains
 * @requires _factory.factory:globalFunction
 * @requires _factory.factory:tokenHandler
 * @requires _directives.directive:cmNotify
 * @requires gettextCatalog
 */

(function () {
    'use strict';
    var directive = function(apiMessage, recipientsMessage, appSettings, $compile, cmNotify,
                                 globalFunction, $timeout, $http, $routeParams,
                                 $rootScope, apiRecipient, $location,
                                 apiCategory, $log, _, ngDialog, tokenHandler, apiDomains,
                                 gettextCatalog, $sce, createMessageFactory,
                                 apiAttachments) {

        return {
            templateUrl: 'views/message/messageDetails.html',
            restrict: "E",
            controller: function($scope) {
                $scope.tabsMenu = {
                    "active": 0
                };
                var vm = this;
                vm.message = {
                    "attachments": []
                };

                vm.getForm = function() {
                    return $scope.messageForm;
                };
            },
            link: function(scope, element, attrs, ctrl) {
                var getAllContacts = [];
                /**
                 * @ngdoc property
                 * @name readOnly
                 * @propertyOf message.directive:cmMessageDetails
                 * @description
                 * Initialize readOnly variable, default: false.
                 */
                scope.readOnly = false;
                /**
                 * @ngdoc property
                 * @name message
                 * @propertyOf message.directive:cmMessageDetails
                 * @description
                 * Initialize object message
                 * ```json
                 * scope.message = {
                 *     "category": [],
                 *     "html": "",
                 *     "attachments": []
                 * };```
                 */
                scope.message = {
                    "category": [],
                    "html": "",
                    "attachments": []
                };
                /**
                 * @ngdoc property
                 * @name updateForm
                 * @propertyOf message.directive:cmMessageDetails
                 * @description
                 * Initialize boolean to activate update message button. Default : false;
                 */
                scope.updateForm = false;

                /**
                 * Editeur container selector
                 */
                var editeur = document.getElementById('editeurContainer');

                /**
                 * Load a detail Message
                 */
                if(_.has($routeParams, "url")) {
                    /**
                     * Set the detailMessage to true, to hide message no domain and no category
                     */
                    $rootScope.detailMessage = true;
                    /**
                     * Set url
                     */
                    scope.message.url = atob($routeParams.url);
                    if($routeParams.status === "sending") {
                        scope.hideSending = true;
                    }
                    /**
                     * Load Message
                     */
                    apiMessage.getOne(scope.message.url).then(function(result) {
                        scope.message = result.data;

                        globalFunction.insertIframe(result.data.html, "#preview_html");

                        //scope.choiceDomains.name
                        var splitSenderMail = result.data.sender_email.split("@");
                        //scope.choiceDomains = splitSenderMail[1];
                        scope.firstPartMail = splitSenderMail[0];
                        apiDomains.getAll().then(function(result) {
                            $log.debug(result);
                            if(result.length > 0) {
                                scope.lastPartMail = _.find(result, { 'name': splitSenderMail[1]});
                            }
                            else {
                                scope.lastPartMail = splitSenderMail[1];
                            }

                        });

                        /*
                         * Read Only ?
                         */
                         if(result.data.status === "sending" || result.data.status === "sent") {
                             scope.readOnly = true;
                         }
                        /*
                         * Set Category
                         */
                        apiCategory.getOne(result.data.category).then(function(d) {
                            scope.message.category = d.data;
                        });
                        /*
                         * Get attachments
                         */
                        $http.get(result.data._links.attachments.href).then(function(data) {
                            $log.debug(data);

                            scope.message.attachments = data.data.results;
                        });
                        /*
                         * Get mails message
                         */
                        scope.urlRecipients = result.data._links.recipients.href;
                        $rootScope.recipientFeedbackTotal = result.data.recipient_count;
                        if(scope.readOnly) {
                            apiRecipient.getAllRecipients(scope.urlRecipients).then(function(resultRecipients) {
                                $log.debug(resultRecipients);
                                $timeout(recipientsMessage.hideSpinner, 500);
                                var allRecipients = [];
                                for(var r = 0; r < resultRecipients.length; r++) {
                                    allRecipients = allRecipients.concat(resultRecipients[r].data.results);
                                }
                                scope.allRecipientsReadOnly = allRecipients;
                            });
                        }

                    });
                }else {
                    element[0].classList.add('creatingMessage');

                    /*
                     * Set by default tracking open and click
                     */
                    scope.message.track_open = true;
                    scope.message.track_clicks = true;
                }

                /**
                 * Watch message to activate the update button
                 */
                scope.$watch("message", function(n, o) {
                    var form = createMessageFactory.getForm();
                    if(!_.isNull(form) && form.$dirty) {
                        scope.updateForm = true;
                    }
                }, true);

                /**
                 * [readOnly]
                 * Pager recipients
                 */
                 scope.showAllRecipients = 100;
                 scope.beginAllRecipients = 0;
                 scope.currentPageAllRecipients = 0;

                 /**
                  * @ngdoc function
                  * @name pagedAllRecipients
                  * @methodOf message.directive:cmMessageDetails
                  * @param {Number} num Page number
                  * @description
                  * Show next recipients
                  */
                 scope.pagedAllRecipients = function(num) {
                     scope.beginAllRecipients = num * scope.showAllRecipients;
                     scope.currentPageAllRecipients = num;
                 };

                /**
                 * @ngdoc function
                 * @name attachmentSuccess
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Function attachment Success
                 * @param {Object} result promise success from attachment api call
                 */

                function attachmentSuccess(result) {
                    //$log.debug(result);
                    cmNotify.message(gettextCatalog.getString("Your attachment has been added"), "success");
                    ctrl.message.attachments = [];
                    scope.message.attachments.push(result.data);
                }

                /**
                 * @ngdoc function
                 * @name attachmentError
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Function attachment Error
                 * @param {Object} error promise error from attachment api call
                 */
                function attachmentError(error) {
                    cmNotify.message(gettextCatalog.getString("Your attachment hasn't been added"), "error");
                    cmNotify.message(error.data.detail, "error");
                }

                /**
                 * @ngdoc function
                 * @name updateMessage
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Update message
                 */
                ctrl.updateMessage = function() {
                    $log.debug("update Message");
                    var messageToPost = scope.message;
                    if(scope.message.category !== undefined) {
                        messageToPost.category = scope.message.category.url;
                    }

                    $log.debug(messageToPost);

                    //remove All lastContacts
                    apiMessage.updateMessage(scope.message.url, messageToPost).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your message has been updated"), "success");
                        /*
                         * Off Listener broadcast
                         */
                        apiCategory.getOne(result.data.category).then(function(d) {
                            scope.message.category = d.data;
                        });
                        if(ctrl.message.attachments.length > 0) {
                            for(var a = 0; a < ctrl.message.attachments.length; a++) {
                                /*
                                 * Post attachments
                                 */
                                apiAttachments.post(ctrl.message.attachments[a], result.data.url).then(attachmentSuccess, attachmentError);
                            }
                        }
                        var form = createMessageFactory.getForm();
                        form.$setPristine();
                        scope.updateForm = false;
                    }, function(){
                        cmNotify.message(gettextCatalog.getString("Your message hasn't been updated"), "success");
                        /*
                         * Off Listener broadcast
                         */
                        $rootScope.$$listeners.updateMessage = [];
                    });
                };

                /**
                 * @ngdoc function
                 * @name sendHtmlToEditeur
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Function to create the url to open toothpaste editor
                 * @param {Number} id message id to call message in Toothpaste
                 * @param {String} nameTpl message name to create a tpl with the same name
                 *
                 */
                scope.sendHtmlToEditeur = function(id, nameTpl, urlMessage) {
                    var newToken = tokenHandler.getToken();
                    $log.debug(appSettings.urlEditeur);
                    var urlIframe = appSettings.urlEditeur + "?r=" + (new Date()).getTime() + "&apiUrl=" + appSettings.apiUrl + "&token=" + newToken + "&urlMessage=" + scope.message.url;
                    if(!_.isUndefined(id)) {
                        urlIframe += "&idMessage=" + id;
                    }
                    if(!_.isUndefined(nameTpl)) {
                        urlIframe += "&nameTpl=" + nameTpl;
                    }

                    $log.debug(scope.message.properties);

                    if(_.has(scope.message.properties, "importHtml")) {
                        urlIframe += "&importHtml=true";
                    }

                    $rootScope.urlEditeur = $sce.trustAsResourceUrl(urlIframe);


                    $rootScope.editeurVisible = true;
                    window.scrollTo(0,0);
                    /*
                     * Create a clone of message object
                     */
                    createMessageFactory.messageModel = _.clone(scope.message);

                    /*
                     * Add overflow Hidden on body to remove scrollbar
                     */
                    $rootScope.hideBody  = 'overflowHideBody iconOnly';
                };

                /**
                 * @ngdoc function
                 * @name closeEditeur
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Function to create the url to open toothpaste editor
                 * @param {Number} id message id to call message in Toothpaste
                 * @param {String} nameTpl message name to create a tpl with the same name
                 *
                 */
                scope.closeEditeur = function() {
                    editeur.classList.add('hidden');
                    document.body.classList.remove("iconOnly");
                    /*
                    * removeClass on body
                    */
                    $rootScope.hideBody = '';
                };

                /**
                 * @ngdoc function
                 * @name sendMessage
                 * @methodOf message.directive:cmMessageDetails
                 * @description send the message
                 */
                scope.sendMessage = function() {
                    /**
                     * Call api
                     */
                    apiMessage.sendMessage(scope.message.url).then(function() {
                        cmNotify.message(gettextCatalog.getString("Message sent"), "success");
                        /**
                         * Get the form and set to dirty false
                         */
                        var form = createMessageFactory.getForm();
                        form.$dirty = false;
                        /**
                         * redirect to message listing
                         */
                        $location.path("/messages/all");
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your message has not been sent"), "error");
                    });
                };

                /**
                 * Update message btn
                 */
                scope.updateMessage = function() {
                    ctrl.updateMessage();
                };

                /**
                 * @ngdoc function
                 * @name showPopInTestMess
                 * @methodOf message.directive:cmMessageDetails
                 * @description Show popIn to send a test Message
                 */
                scope.showPopInTestMess = function() {
                    ngDialog.openConfirm({
                        template: '<cm-send-test-dialog on-success="closeThisDialog()" url-message="'+ scope.message.url+'"></cm-send-test-dialog>',
                        plain: true
                    });
                };

                /**
                 * TODO Use a ng-class
                 */
                scope.popInMessage = function() {
                    document.getElementById('containerIframe').classList.toggle('previewIframeFull');
                };

                /**
                 * @ngdoc function
                 * @name deleteMessage
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Delete a message
                 */
                scope.deleteMessage = function() {
                    apiMessage.deleteMessage(scope.message.url).then(function() {
                        cmNotify.message(gettextCatalog.getString("Message deleted"), "success");
                        $location.path("messages/all");
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your message has not been deleted"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name deleteAttachment
                 * @methodOf message.directive:cmMessageDetails
                 * @description
                 * Delete a attachment
                 * @param {String} url attachment url
                 * @param {Number} idx index to remove in attachments array
                 */
                scope.deleteAttachment = function(url, idx) {
                    $log.debug("attachment deleted");
                    apiAttachments.delete(url).then(function() {
                        cmNotify.message(gettextCatalog.getString("Attachment deleted"), "success");
                        scope.message.attachments.splice(idx, 1);
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your attachment has not been deleted"), "error");
                    });
                };

            }
        };
    };

    module.exports = directive;

}());
