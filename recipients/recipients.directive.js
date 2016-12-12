/**
 * @ngdoc directive
 * @name recipients.directive:cmRecipients
 * @description
 * A directive for recipients
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$injector
 * @requires https://docs.angularjs.org/api/ng/service/$q
 * @requires https://docs.angularjs.org/api/ng/service/$timeout
 * @requires _factory.factory:cmNotify
 * @requires _factory.factory:infiniteScrollFactory
 * @requires user.factory:apiUser
 * @requires recipients.factory:recipientsMessage
 * @requires recipients.factory:apiRecipient
 * @requires message.factory:messageDetailsFactory
 * @requires Lodash
 * @requires appSettings
 */
(function () {
    'use strict';

    var directive = function(_, $log, recipientsMessage,
                             $rootScope, apiRecipient, cmNotify, gettextCatalog, $q,
                             postMessageHandler, ngDialog, infiniteScrollFactory, messageDetailsFactory,
                             $timeout, $injector, appSettings) {
        return {
            templateUrl:'views/recipients/recipients.html',
            require: ['^cmMessageDetails', 'cmRecipients'],
            controller: function($scope) {
                $scope.contactsTable = [];
                $scope.groupsTable = [];
                $scope.dlsTable = [];
                $scope.otherTable = [];
                $scope.textareaTable = [];
                $scope.csvResult = [];
                $scope.csvAdded = [];
                $scope.clistAdded = [];
                $scope.viewMode = false;
                $scope.showZimbraContacts = false;
                $scope.allContacts = 0;

                $log.debug('textareaTable');
                $log.debug($scope.textareaTable);

                $scope.limitCsv = 20;
                $scope.limitDls = 20;
                $scope.limitGroup = 20;
                $scope.limitOther = 20;
                $scope.limitContact = 20;
                $scope.limitManual = 20;
                $scope.limitClist = 20;

                infiniteScrollFactory.nextElements = null;
                infiniteScrollFactory.isBusy = false;
                $scope.infinite = infiniteScrollFactory;

                $scope.recipientsTab = {
                    'active': 0
                };
                $scope.activeValue = 0;

                if(appSettings.source === "Jaw") {
                    $scope.recipientsTab.active = 1;
                    $scope.activeValue = 1;
                }

                /**
                 * @ngdoc function
                 * @name postContact
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} uniqArr Array with single mails
                 * @param {Array} originalArr Original array without modifications
                 * @description
                 * Function post Distribution list
                 * TODO split to recipientContactZimlet.directive.js
                 */

                function postContact(uniqArr, originalArr) {
                    $log.debug("uniqArr");
                    $log.debug(uniqArr);
                    $log.debug("originalArr");
                    $log.debug(originalArr);
                    var groupedBySourceRef = _.groupBy(originalArr, "source_ref");
                    apiRecipient.bulkPost(uniqArr).then(function(results) {
                        $log.debug("results bulkPost");
                        $log.debug(results);
                        for(var r = 0; r < results.length; r++) {
                            var contactsAdded = results[r].data.results;
                            if(_.size(results[r].data.validation_errors) > 0) {
                                cmNotify.message(recipientsMessage.contactsValidationsError(results[r].data.validation_errors), "warning", true);
                            }
                            if(results[r].data.duplicates.length > 0) {
                                cmNotify.message(recipientsMessage.contactsDuplicatesError(results[r].data.duplicates), "warning", true);
                            }
                            if(results[r].data.results.length > 0) {
                                cmNotify.message(gettextCatalog.getPlural(results[r].data.results.length, "Added 1 contact", "Added {{$count}} contacts", {}), "success");
                            }
                            $scope.allContacts += results[r].data.results.length;
                            for(var c = 0; c < contactsAdded.length; c++) {
                                $scope.contactsTable.push(contactsAdded[c]);
                                groupedBySourceRef[contactsAdded[c].source_ref][0].isHidden = true;
                                $scope.zcontactLength--;
                            }
                            $timeout(recipientsMessage.hideSpinner, 500);
                            _.forOwn(groupedBySourceRef, recipientsMessage.removeSelected);
                        }
                    });
                }

                /**
                 * @ngdoc function
                 * @name addContactSelected
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} arr Array
                 * @description
                 * Get selected contacts, prepare for API and checkDuplicate
                 */
                this.addContactSelected = function(arr) {
                    var result = recipientsMessage.selectedContact(arr);
                    var cloneRecipients = _.clone(result);
                    var contactSelectedPrepared = recipientsMessage.prepareContact(cloneRecipients, $scope.message.url);

                    recipientsMessage.checkDuplicate(contactSelectedPrepared, result, postContact);
                };

                /**
                 * @ngdoc function
                 * @name addContact
                 * @methodOf recipients.directive:cmRecipients
                 * @param {String} recipient A single mail
                 * @description
                 * Get contact, prepare for API and checkDuplicate
                 */
                this.addContact = function(recipient) {
                    var cloneRecipient = _.clone(recipient);
                    var contactToSend = recipientsMessage.prepareSingleContact(cloneRecipient, $scope.message.url);
                    var arr = [];
                    recipientsMessage.checkDuplicate([contactToSend], [recipient], postContact);
                };

                /**
                 * @ngdoc function
                 * @name postContact
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} uniqArr Array with single mails
                 * @param {Array} originalArr Original array without modifications
                 * @description
                 * Function post Group to Api
                 * TODO split to recipientGroupZimlet.directive.js
                 */

                function postGroup(uniqArr, originalArr) {
                    var request = [];
                    var getKey = [];
                    var allCloneGroup = _.cloneDeep(originalArr);
                    var groupedBySource = _.groupBy(uniqArr, "source");
                    _.forOwn(groupedBySource, function(v, k) {
                        $log.debug(k);
                        request.push(apiRecipient.bulkPost(v));
                        getKey.push(k);
                    });

                    function resultRequest(arr, it) {
                        var groupToInsert = recipientsMessage.returnResultToInsertOrHide(getKey[it], allCloneGroup);
                        _.forOwn(arr, function(v, k) {
                            if(_.size(v.data.validation_errors) > 0) {
                                cmNotify.message('['+getKey[it]+'] ' + recipientsMessage.contactsValidationsError(v.data.validation_errors), "warning", true);
                            }
                            if(v.data.duplicates.length > 0) {
                                cmNotify.message('['+getKey[it]+'] ' + recipientsMessage.contactsDuplicatesError(v.data.duplicates), "warning", true);
                            }
                            if(v.data.results.length > 0) {
                                cmNotify.message(gettextCatalog.getPlural(v.data.results.length, "Added 1 member of the group {{group}}", "Added {{$count}} members of the group {{group}}", {group: getKey[it]}), "success");
                            }
                            $scope.allContacts += v.data.results.length;
                            groupToInsert[it].members = v.data.results;
                            originalArr[it].isHidden = true;
                            $scope.groupsTable.push(groupToInsert[it]);
                            _.forOwn(originalArr, recipientsMessage.removeSelectedDlGroup);
                            $timeout(recipientsMessage.hideSpinner, 500);
                        });
                        $scope.groupLength--;
                    }

                    $q.all(request).then(function(data) {
                        $log.debug(data);
                        for(var d = 0; d < data.length; d++ ) {
                            resultRequest(data[d], d);
                        }
                    });
                }

                /**
                 * @ngdoc function
                 * @name addGroup
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} group Array with groups
                 * @description
                 * Get group, prepare for API and checkDuplicate
                 */
                this.addGroup = function(group) {
                    // Add Source to group by source to get key and manage duplicate
                    var source = "";
                    var cloneGroupMembers = _.clone(group.members);
                    if(_.has(group, "name")) {
                        source = group.name;
                    }
                    for(var m = 0; m < group.members.length; m++) {
                        group.members[m].source = source;
                    }
                    var groupMembersPrepared = recipientsMessage.prepareContact(cloneGroupMembers, $scope.message.url);
                    recipientsMessage.checkDuplicate(groupMembersPrepared, [group], postGroup);
                };

                /**
                 * @ngdoc function
                 * @name addGroupSelected
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} group Array with groups
                 * @description
                 * Get group selected, prepare for API and checkDuplicate
                 */
                this.addGroupSelected = function(arr) {
                    var result = recipientsMessage.selectedContact(arr);
                    var allGroupsMembers = recipientsMessage.addSourceMembers(result);
                    var groupMembersPrepared = recipientsMessage.prepareContact(allGroupsMembers, $scope.message.url);

                    recipientsMessage.checkDuplicate(groupMembersPrepared, result, postGroup);
                };

                /**
                 * @ngdoc function
                 * @name postDl
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} uniqArr Array with single mails
                 * @param {Array} originalArr Original array without modifications
                 * @description
                 * Function post Distribution list
                 * TODO split to recipientDlZimlet.directive.js
                 */
                function postDl(uniqArr, originalArr) {
                    // $log.debug(data);
                    $log.debug("uniqArr");
                    $log.debug(uniqArr);
                    var groupedBySource = _.groupBy(uniqArr, "source");
                    var request = [];
                    var getKey = [];
                    _.forOwn(groupedBySource, function(v, k) {
                        getKey.push(k);
                        request.push(apiRecipient.bulkPost(v));
                    });
                    var allCloneDl = _.cloneDeep(originalArr);
                    function resultRequest(arr, it) {
                        $log.debug(it);
                        var dlToInsert = recipientsMessage.returnResultToInsertOrHide(getKey[it], allCloneDl);
                        var totalResult = 0;
                        _.forOwn(arr, function(v, k) {
                            if(_.size(v.data.validation_errors) > 0) {
                                cmNotify.message('['+getKey[it]+'] ' + recipientsMessage.contactsValidationsError(v.data.validation_errors), "warning", true);
                            }
                            if(v.data.duplicates.length > 0) {
                                cmNotify.message('['+getKey[it]+'] ' + recipientsMessage.contactsDuplicatesError(v.data.duplicates), "warning", true);
                            }
                            $scope.allContacts += v.data.results.length;
                            totalResult += v.data.results.length;
                            dlToInsert[it].members = v.data.results;
                            originalArr[it].isHidden = true;
                            $scope.dlsTable.push(dlToInsert[it]);
                            _.forOwn(originalArr, recipientsMessage.removeSelectedDlGroup);
                            $timeout(recipientsMessage.hideSpinner, 500);
                        });
                        if(totalResult > 0) {
                            cmNotify.message(gettextCatalog.getPlural(totalResult, "Added 1 member of the list {{list}}", "Added {{$count}} members of the list {{list}}", {list: getKey[it]}), "success");
                        }
                        $scope.dlLength--;
                    }
                    $q.all(request).then(function(data) {
                        $log.debug(data);
                        for(var d = 0; d < data.length; d++ ) {
                            resultRequest(data[d], d);
                        }
                    });
                }

                /**
                 * @ngdoc function
                 * @name addDlSelected
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} arr Array
                 * @description
                 * Get selected distributions list, prepare for API and checkDuplicate
                 */
                this.addDlSelected = function(arr) {
                    var result = recipientsMessage.selectedContact(arr);
                    $log.debug(result);

                    var allDlsMembers = recipientsMessage.addSourceMembers(result);
                    var dlMembersPrepared = recipientsMessage.prepareContact(allDlsMembers, $scope.message.url);

                    recipientsMessage.checkDuplicate(dlMembersPrepared, result, postDl);
                };

                /**
                 * @ngdoc function
                 * @name addDl
                 * @methodOf recipients.directive:cmRecipients
                 * @param {Array} dl Array
                 * @description
                 * Get single distribution list, prepare for API and checkDuplicate
                 */
                this.addDl = function(dl) {
                    // Add Source to group by source to get key and manage duplicate
                    var source = dl.email;
                    if(_.has(dl, "name")) {
                        source = dl.name;
                    }
                    for(var m = 0; m < dl.members.length; m++) {
                        dl.members[m].source = source;
                    }
                    var dlMembersPrepared = recipientsMessage.prepareContact(dl.members, $scope.message.url);

                    recipientsMessage.checkDuplicate(dlMembersPrepared, [dl], postDl);
                };

                this.tags = [];

            },
            link: function(scope, element, attrs, ctrl) {
                var zimbra;
                if(appSettings.source === "Zimlet") {
                    zimbra = $injector.get("zimbra");
                    scope.showZimbraContacts = true;
                }else if(appSettings.source === "Jaw") {
                    scope.showJawContacts = true;
                }

                /**
                 * @ngdoc function
                 * @name openContacts
                 * @methodOf recipients.directive:cmRecipients
                 * @description
                 * On click on tabs recipients, ask to Zimbra contacts
                 */
                scope.openContacts = function() {
                    window.scrollTo(0,0);

                    if (appSettings.source === "Zimlet") {

                        $rootScope.contactSpinner = true;
                        /**
                         * Init object to send to Zimbra
                         */
                        var getContacts = {
                            "getContacts": {
                                "asTree": false
                            }
                        };

                        /**
                         * Retrieve source-type/ref info for existing recipients
                         */
                        if(_.size(scope.recipientsSourceType) > 0) {
                            var arrSourceType = messageDetailsFactory.getSourceType(scope.recipientsSourceType);
                            $log.debug(arrSourceType);
                            getContacts.getContacts.existing = arrSourceType;
                        }

                        /**
                         * Postmessage to Zimbra to get contact
                         */
                        postMessageHandler.post(getContacts);

                    } else if(appSettings.source === "Jaw") {
                        /**
                         * Get all Recipients
                         */
                        scope.allContacts = $rootScope.recipientFeedbackTotal;
                        apiRecipient.getAllRecipients(scope.urlRecipients).then(function(resultRecipients) {
                            $timeout(recipientsMessage.hideSpinner, 500);
                            var allRecipients = [];
                            for(var r = 0; r < resultRecipients.length; r++) {
                                allRecipients = allRecipients.concat(resultRecipients[r].data.results);
                            }
                            /*
                             * Group by source_type
                             */
                            scope.recipientsSourceType = _.groupBy(allRecipients, "source_type");

                            if(_.has(scope.recipientsSourceType, "manual")) {
                                scope.textareaTable = scope.recipientsSourceType.manual;
                            }

                            if(_.has(scope.recipientsSourceType, "csv")) {
                                var csvGroupByRef = recipientsMessage.groupByRef(scope.recipientsSourceType.csv);
                                _.forOwn(csvGroupByRef, function(v, k) {
                                    scope.csvAdded.push(v);
                                });
                            }
                            if(_.has(scope.recipientsSourceType, "clist")) {
                                var listGroupByRef = recipientsMessage.groupByRef(scope.recipientsSourceType.clist);
                                _.forOwn(listGroupByRef, function(v, k) {
                                    var listToInsert = {
                                        "name": "",
                                        "contacts": []
                                    };
                                    var listFounded = _.find(scope.jawClists, function(list) {
                                        if(list.url === k) {
                                            listToInsert.name = list.name;
                                            return list;
                                        }
                                    });
                                    listFounded.isHidden = true;
                                    listToInsert.contacts = v;
                                    scope.clistAdded.push(listToInsert);
                                });
                            }
                        });
                    }
                    /*
                     * Compile contact
                     */
                    // var recipientsContainer = document.getElementById("recipientsContainer");
                    // if(appSettings.source === "Zimlet") {
                    //     recipientsContainer.innerHTML = '<cm-recipients></cm-recipients>';
                    // }else if (appSettings.source === "Jaw") {
                    //     recipientsContainer.innerHTML = '<cm-recipients-jaw recipients="recipientsMessage"></cm-recipients-jaw>';
                    // }
                    // $compile(recipientsContainer)(scope);
                };

                /**
                 * Next contact functions
                 */
                scope.showNextContact = function() { scope.limitContact += 20; };
                scope.showNextGroup = function() { scope.limitGroup += 20; };
                scope.showNextDls = function() { scope.limitDls += 20; };
                scope.showNextCsv = function() { scope.limitCsv += 20; };
                scope.showNextOther = function() { scope.limitOther += 20; };
                scope.showNextManual = function() { scope.limitManual += 20; };
                scope.showNextClist = function() { scope.limitClist += 20; };

                /*
                 * CSV
                 */
                scope.showRecipients = 100;
                scope.beginRecipients = 0;
                scope.currentPageRecipients = 0;

                scope.paged = function(num) {
                    scope.beginRecipients = num * scope.showRecipients;
                    scope.currentPageRecipients = num;
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name importCsv
                 * @description
                 * Import csv contacts, post recipients to API
                 */
                scope.importCsv = function() {
                    recipientsMessage.csvName = scope.csvName;
                    var csvResultWithSources = [];
                    _.forOwn(scope.csvResult, function(v, k) {
                            v.source = scope.csvName;
                            csvResultWithSources.push(v);
                    });
                    var csvArrPrepared = recipientsMessage.prepateCsvContacts(csvResultWithSources, scope.message.url);

                    recipientsMessage.checkDuplicate(csvArrPrepared, scope.csvResult, function(uniqArr, originalArr) {
                        $rootScope.recipientSpinner = true;
                        apiRecipient.bulkPost(uniqArr).then(function(result) {
                            var totalResult = 0;
                            for(var r = 0; r < result.length; r++) {
                                if(_.size(result[r].data.validation_errors) > 0) {
                                    $log.debug("result[r].data.validation_errors");
                                    $log.debug(result[r].data.validation_errors);
                                    cmNotify.message(recipientsMessage.contactsValidationsError(result[r].data.validation_errors), "warning", true);
                                }
                                if(result[r].data.duplicates.length > 0) {
                                    $log.debug("result[r].data.duplicates");
                                    $log.debug(result[r].data.duplicates);
                                    cmNotify.message(recipientsMessage.contactsDuplicatesError(result[r].data.duplicates), "warning", true);
                                }
                                totalResult += result[r].data.results.length;
                                scope.allContacts += result[r].data.results.length;

                                for(var rr = 0; rr < result[r].data.results.length; rr++) {
                                    scope.csvAdded.push(result[r].data.results[rr]);
                                }
                            }
                            $rootScope.recipientSpinner = false;
                            scope.csvResult = [];
                            cmNotify.message(gettextCatalog.getPlural(totalResult, "Added 1 recipient from CSV file", "Added {{$count}} recipients from CSV file", {}), "success", true);
                            $timeout(recipientsMessage.hideSpinner, 500);
                        }, scope.headerCsv);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name cancelCsvImport
                 * @description
                 * Reset array csv
                 */
                scope.cancelCsvImport = function() {
                    scope.csvResult = [];
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name removeCsvRecipient
                 * @description
                 * Remove csv recipients in API
                 * @param {Object} mail Passing object recipient
                 * @param {Number} index Passing object recipient
                 */
                scope.removeCsvRecipient = function(mail, index) {
                    apiRecipient.deleteMail(mail.url).then(function() {
                        scope.csvAdded.splice(index, 1);
                        scope.allContacts--;
                        cmNotify.message(gettextCatalog.getString("Removed {{to}}", {to: mail.to}), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("{{to}} has not been removed", {to: mail.to}), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name removeAllCsvRecipients
                 * @description
                 * Delete all csv recipients
                 * @param {Array} csvContacts Array with all csv url
                 */
                scope.removeAllCsvRecipients = function(csvContacts) {
                    var arrUrl = recipientsMessage.extractUrl(csvContacts);
                    var count = arrUrl.length;
                    $log.debug(arrUrl);

                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        scope.csvAdded = [];
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed 1 recipient", "Removed {{$count}} recipients", {}), "success");
                        scope.allContacts -= count;
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name addManualRecipient
                 * @description
                 * Add manual recipients
                 */
                scope.addManualRecipient = function() {
                    var textAreaPrepared = [];
                    var contactTextarea = scope.textareaMail.split("\n");
                    var errors = "";
                    for(var s = 0; s < contactTextarea.length; s++) {
                        if(recipientsMessage.mailRegexp.test(contactTextarea[s])) {
                            var objTextarea = recipientsMessage.prepareSingleManualContact(contactTextarea[s], scope.message.url);
                            textAreaPrepared.push(objTextarea);
                            //scope.textareaTable.push(objTextarea);
                        }
                        else  {
                            errors += contactTextarea[s] + "<br/>";
                        }
                    }
                    // var groupMembersPrepared = recipientsMessage.prepareContact(allGroupsMembers, $scope.message.url);
                    recipientsMessage.checkDuplicate(textAreaPrepared, contactTextarea, function(uniqArr, initArr) {
                        apiRecipient.bulkPost(uniqArr).then(function(result) {
                            $log.debug(result);
                            var totalResult = 0;
                            for(var r = 0; r < result.length; r++) {
                                if(_.size(result[r].data.validation_errors) > 0) {
                                    cmNotify.message(recipientsMessage.contactsValidationsError(result[r].data.validation_errors), "warning", true);
                                }
                                if(result[r].data.duplicates.length > 0) {
                                    cmNotify.message(recipientsMessage.contactsDuplicatesError(result[r].data.duplicates), "warning", true);
                                }
                                totalResult += result[r].data.results.length;
                                scope.allContacts += result[r].data.results.length;
                                for(var rr = 0; rr < result[r].data.results.length; rr++) {
                                    scope.textareaTable.push(result[r].data.results[rr]);
                                }
                            }
                            if(totalResult > 0) {
                                cmNotify.message(gettextCatalog.getPlural(totalResult, "Added 1 recipient", "Added {{$count}} recipients", {}), "success");
                            }
                            $timeout(recipientsMessage.hideSpinner, 500);
                            scope.textareaMail = [];
                        });
                    });
                    if(errors !== "") {
                        cmNotify.message(gettextCatalog.getString('Emails with errors:') + '<br/> ' + errors, 'error', true);
                    }
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name removeManualRecipient
                 * @description
                 * Remove single manual recipient
                 * @param {Object} mail Passing mail object
                 * @param {Number} index Index array to delete in manual array
                 */
                scope.removeManualRecipient = function(mail, index) {
                    apiRecipient.deleteMail(mail.url).then(function() {
                        scope.textareaTable.splice(index, 1);
                        scope.allContacts--;
                        cmNotify.message(gettextCatalog.getString("Removed {{to}}", {to: mail.to}), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("{{to}} has not been removed", {to: mail.to}), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf recipients.directive:cmRecipients
                 * @name removeAllManualRecipients
                 * @description
                 * Add manual recipients
                 * @param {Object} manualContact Passing mail object
                 * @param {Number} index Index array to delete in manual array
                 */
                scope.removeAllManualRecipients = function(manualContact) {
                    $log.debug(manualContact);
                    var arrUrl = recipientsMessage.extractUrl(manualContact);
                    var count = arrUrl.length;
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        scope.textareaTable = [];
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed 1 recipient", "Removed {{$count}} recipients", {}), "success");
                        scope.allContacts -= count;
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc event
                 * @eventOf recipients.directive:cmRecipients
                 * @name zimbraContactsCollected
                 * @description
                 * Get zimbra postMessage
                 * @eventType broadcast
                 */
                $rootScope.$on("zimbraContactsCollected", function(e, args) {
                    $log.debug("received");
                    $log.debug(args.collectedContacts);
                    var zimbraCollected = args.collectedContacts;

                    scope.contactsTable = [];
                    scope.groupsTable = [];
                    scope.dlsTable = [];
                    scope.otherTable = [];

                    scope.allContacts = $rootScope.recipientFeedbackTotal;

                    scope.$apply(function() {
                        zimbra = args.collectedContacts;
                        $log.debug("zimbra");
                        $log.debug(zimbra);
                        scope.zcontacts = zimbraCollected.contacts;
                        scope.groups = zimbraCollected.groups;
                        scope.dls = zimbraCollected.dls;
                        scope.tags = zimbraCollected.tags;
                        scope.contactsTree = zimbraCollected.tree;

                        scope.zcontactLength = 0;
                        scope.groupLength = 0;
                        scope.dlLength = 0;

                        _.forOwn(zimbraCollected.groups, function(v, k) {
                            if(_.has(v, "name")) {
                                scope.groupLength++;
                            }
                        });

                        _.forOwn(zimbraCollected.contacts, function(v, k) {
                            if(_.has(v, "email")) {
                                scope.zcontactLength++;
                            }
                        });

                        _.forOwn(zimbraCollected.dls, function(v, k) {
                            if(_.has(v, "name") || _.has(v, "email")) {
                                scope.dlLength++;
                            }
                        });

                        ctrl[1].tags = zimbraCollected.tags;

                        $rootScope.contactSpinner = false;
                    });

                    /**
                     * Check the recipients total
                     */
                    if($rootScope.recipientFeedbackTotal > 0) {
                        $log.debug("$rootScope.recipientFeedbackTotal");
                        apiRecipient.getAllRecipients(scope.urlRecipients).then(function(resultRecipients) {
                            $log.debug(resultRecipients);
                            $timeout(recipientsMessage.hideSpinner, 500);
                            var allRecipients = [];
                            for(var r = 0; r < resultRecipients.length; r++) {
                                allRecipients = allRecipients.concat(resultRecipients[r].data.results);
                            }
                            $log.debug(allRecipients);
                            /*
                             * Get mails message
                             */
                            scope.recipientsSourceType = _.groupBy(allRecipients, "source_type");
                            $log.debug(scope.recipientsSourceType);
                            $log.debug("scope.recipientsSourceType.manual");
                            $log.debug(scope.recipientsSourceType.manual);
                            if(_.has(scope.recipientsSourceType, "manual")) {
                                scope.textareaTable = scope.recipientsSourceType.manual;
                            }

                            if(_.has(scope.recipientsSourceType, "csv")) {
                                scope.csvAdded = scope.recipientsSourceType.csv;
                            }
                            /*
                             * Reset contact, groups and dl
                             */
                            scope.contactsTable = [];
                            scope.groupsTable = [];
                            scope.dlsTable = [];
                            scope.otherTable = [];

                            if(_.has(scope.recipientsSourceType, "zimbra-contact")) {
                                scope.contactsTable = scope.recipientsSourceType["zimbra-contact"];
                            }

                            /*
                             * Create clone dls, group and tree to save state switch mode
                             */
                            var cloneGroups = _.cloneDeep(zimbraCollected.groups);
                            var cloneDls = _.cloneDeep(zimbraCollected.dls);
                            var cloneTree = _.cloneDeep(zimbraCollected.tree);

                            $log.debug("cloneTree");
                            $log.debug(cloneTree);
                            var cloneTreeFiltered;
                            if(!_.isUndefined(cloneTree)) {
                                cloneTreeFiltered = recipientsMessage.filterContacts(cloneTree);
                                $log.debug(cloneTreeFiltered);
                            }

                            /*
                             * Group contact from Api
                             */
                            var groupsMembers = _.groupBy(scope.recipientsSourceType["zimbra-group"], "source_ref");
                            var dlsLMembers = _.groupBy(scope.recipientsSourceType["zimbra-dl"], function(v, k) {
                                var sourceRefSplitted = v.source_ref.split(":");
                                return sourceRefSplitted[0] + ":" + sourceRefSplitted[1];
                            });
                            var groupById;
                            if(!scope.viewMode) {
                                groupById = _.groupBy(cloneGroups, "id");
                            }else {
                                groupById = _.groupBy(cloneTreeFiltered.groups, "id");
                            }
                            var dlById = _.groupBy(cloneDls, "id");

                            _.forOwn(groupsMembers, function(v, k) {
                                var getId = k.split(":");
                                var id = getId[1] + ":" + getId[2];
                                $log.debug(groupById[id]);
                                if(!_.isUndefined(groupById[id])) {
                                    groupById[id][0].members = v;
                                    scope.groupsTable.push(groupById[id][0]);
                                }else {
                                    for(var m = 0; m < v.length; m++) {
                                        // NOTE: what is this??
                                        scope.otherTable.push(v[m]);
                                    }
                                }
                            });

                            _.forOwn(dlsLMembers, function(v, k) {
                                var getId = k.split(":");
                                dlById[getId[1]][0].members = v;
                                scope.dlsTable.push(dlById[getId[1]][0]);
                            });

                            $log.debug(scope.recipientsSourceType["zimbra-contact"]);
                            $log.debug("scope.recipientsSourceType");
                            $log.debug(scope.recipientsSourceType);

                            var counterHiddenContacts = 0;

                            _.forOwn(scope.contactsTable, function(v, k) {
                                var arrId;
                                if(scope.viewMode) {
                                    arrId = recipientsMessage.findDeep(zimbraCollected.tree, "source_ref");
                                }else {
                                    arrId = recipientsMessage.findDeep(zimbraCollected.contacts, "source_ref");
                                }
                                var result = _.find(arrId, function(obj) {
                                    if(obj.source_ref === v.source_ref) {
                                        return obj;
                                    }
                                });
                                counterHiddenContacts++;
                                if(!_.isUndefined(result)) {
                                    result.isHidden = true;
                                }
                            });
                            _.forOwn(scope.groupsTable, function(v, k) {
                                var arrId;
                                if(scope.viewMode) {
                                    arrId = recipientsMessage.findDeep(zimbraCollected.tree, "id");
                                }else {
                                    arrId = recipientsMessage.findDeep(zimbraCollected.groups, "id");
                                }
                                var result = _.find(arrId, function(obj) {
                                    if(obj.id === v.id) {
                                        return obj;
                                    }
                                });
                                counterHiddenContacts++;
                                if(!_.isUndefined(result)) {
                                    result.isHidden = true;
                                }
                            });
                            _.forOwn(scope.dlsTable, function(v, k) {
                                var arrId;
                                arrId = recipientsMessage.findDeep(zimbraCollected.dls, "id");
                                var result = _.find(arrId, function(obj) {
                                    if(obj.id === v.id) {
                                        return obj;
                                    }
                                });
                                counterHiddenContacts++;
                                if(!_.isUndefined(result)) {
                                    result.isHidden = true;
                                }
                            });

                            if(zimbraCollected.contacts.length !== undefined) {
                                scope.zcontactLength = zimbraCollected.contacts.length - counterHiddenContacts;
                                recipientsMessage.contactsTotal = zimbraCollected.contacts.length - counterHiddenContacts;
                            }
                            var sizeContact = _.groupBy(zimbraCollected.contacts, "isHidden");
                            var sizeGroup = _.groupBy(zimbraCollected.groups, "isHidden");
                            var sizeDl = _.groupBy(zimbraCollected.dls, "isHidden");

                            scope.zcontactLength = _.size(sizeContact.undefined);
                            recipientsMessage.contactsTotal = _.size(sizeContact.undefined);

                            scope.groupLength = _.size(sizeGroup.undefined);
                            recipientsMessage.groupsContactTotal = _.size(sizeGroup.undefined);

                            if(zimbraCollected.dls.length !== undefined) {
                                scope.dlLength = _.size(sizeDl.undefined);
                                recipientsMessage.dlTotal = _.size(sizeDl.undefined);
                            }
                        });
                    }

                });

                /*
                 * Prevent memory leak
                 */
                scope.$on('$destroy', function(event, data) {
                    $rootScope.$$listeners.collectedContact = [];
                });
            }
        };

    };

    module.exports = directive;
}());
