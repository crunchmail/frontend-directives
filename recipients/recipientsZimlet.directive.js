/**
 * @ngdoc directive
 * @name recipientsZimlet.directive:cmRecipientsZimlet
 * @description Directive to display recipient from Zimbra
 */


(function () {
    'use strict';

    var directive = function(_, $log, $rootScope, recipientsMessage, zimbra, apiRecipient, postMessageHandler,
                            messageDetailsFactory, cmNotify, gettextCatalog, $q, $http) {
        return {
            templateUrl:'views/recipients/recipientsZimlet.html',
            require: ['^cmMessageDetails', '^cmRecipients'],
            controller: function($scope) {
                $scope.contactTabs = {
                    "active": 0
                };
                $scope.selected = {
                    tags: []
                };

                $scope.limitContactZimbra = 20;

                /**
                 * @ngdoc function
                 * @name tagFilter
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Object} item item to filter
                 * @description
                 * Show contact with the good tag selected
                 */
                $scope.tagFilter = function(item) {
                    if($scope.selected.tags.length > 0) {
                        var tagsSel = $scope.selected.tags;
                        if(_.has(item, 'tags')) {
                            for(var t = 0; t < tagsSel.length; t++ ) {
                                for(var tt = 0; tt < item.tags.length; tt++) {
                                    if(tagsSel[t].name === item.tags[tt].name) {
                                        return item;
                                    }
                                }
                            }
                        }
                    }else {
                        return item;
                    }
                };
            },
            link: function(scope, element, attrs, ctrl) {

                /**
                 * @ngdoc function
                 * @name switchContact
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @description
                 * Switch beetween tree and grouped mode
                 */
                scope.switchContact = function() {
                    $log.debug(scope.viewMode);
                    var getTreeContacts = {
                        "getContacts": {
                            "asTree": scope.viewMode
                        }
                    };

                    /**
                     * Retrieve source-type/ref info for existing recipients
                     */
                    if(_.size(scope.recipientsSourceType) > 0) {
                        var arrSourceType = messageDetailsFactory.getSourceType(scope.recipientsSourceType);
                        $log.debug(arrSourceType);
                        getTreeContacts.getContacts.existing = arrSourceType;
                    }

                    /*
                     * Ask to parent (Zimbra) contacts format tree
                     */
                    postMessageHandler.post(getTreeContacts);
                };

                /**
                 * @ngdoc function
                 * @name checkSelected
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} arr Passing the array to filter
                 * @description
                 * Enabled/Disabled the button to add recipients
                 */
                scope.checkSelected = function(arr) {
                    var selected = _.groupBy(arr, "selected");
                    if(_.has(selected, "true")) {
                        return false;
                    }else {
                        return true;
                    }
                };

                /**
                 * @ngdoc function
                 * @name selectAll
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} arr Passing the array to filter
                 * @param {Boolean} checked Passing the array to filter
                 * @description
                 * Select/Deselect all recipients
                 */
                scope.selectAll = function(arr, checked) {
                    if(checked) {
                        _.forOwn(arr, function(v, k) {
                            v.selected = true;
                        });
                    }
                    else {
                        _.forOwn(arr, function(v, k) {
                            v.selected = false;
                        });
                    }
                };

                /**
                 * @ngdoc function
                 * @name itemClicked
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Number} idx Array index
                 * @param {Object} item Object to find
                 * @param {Array} arr Passing the array
                 * @description
                 * Select a item
                 */
                scope.itemClicked = function (idx, item, arr) {
                    recipientsMessage.selectItem(idx, item, arr);
                };

                /**
                 * @ngdoc function
                 * @name itemClicked
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Number} idx Array index
                 * @param {Object} item Object to find
                 * @param {Array} arr Passing the array
                 * @description
                 * Select a item
                 */
                scope.showNextContactsZimbra = function() {
                    scope.limitContactZimbra += 20;
                };

                /**
                 * @ngdoc function
                 * @name addContactRecipientSelected
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} arr Passing the array
                 * @description
                 * Add multiple contact selected
                 */
                scope.addContactRecipientSelected = function(arr) {
                    ctrl[1].addContactSelected(arr);
                };
                /**
                 * @ngdoc function
                 * @name addContactRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Object} recipient Passing recipient
                 * @description
                 * Add single recipient
                 */
                scope.addContactRecipient = function(recipient) {
                    ctrl[1].addContact(recipient);
                };
                /**
                 * @ngdoc function
                 * @name addGroupRecipientSelected
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} arr Passing the array
                 * @description
                 * Add multiple group selected
                 */
                scope.addGroupRecipientSelected = function(arr) {
                    ctrl[1].addGroupSelected(arr);
                };
                /**
                 * @ngdoc function
                 * @name addContactRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Object} recipient Passing recipient
                 * @description
                 * Add single group
                 */
                scope.addGroupRecipient = function(group) {
                    ctrl[1].addGroup(group);
                };
                /**
                 * @ngdoc function
                 * @name addDlistRecipientSelected
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} arr Passing the array
                 * @description
                 * Add multiple distribution list selected
                 */
                scope.addDlistRecipientSelected = function(arr) {
                    ctrl[1].addDlSelected(arr);
                };
                /**
                 * @ngdoc function
                 * @name addContactRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Object} recipient Passing recipient
                 * @description
                 * Add single distribution list
                 */
                scope.addDlistRecipient = function(dl) {
                    ctrl[1].addDl(dl);
                };

                /**
                 * @ngdoc function
                 * @name removeContactRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Number} idx Array index
                 * @param {Object} contact Object to delete
                 * @description
                 * Remove contact in API and arrray
                 */
                scope.removeContactRecipient = function(idx, contact) {
                    $log.debug("zimbra delete contact");
                    $log.debug(zimbra);
                    apiRecipient.deleteMail(contact.url).then(function() {
                        if(!scope.viewMode) {
                            recipientsMessage.findElement(zimbra.contacts, contact, "source_ref");
                        }else {
                            recipientsMessage.findElement(zimbra.tree, contact, "source_ref");
                        }
                        recipientsMessage.deleteContact(idx, scope.contactsTable);
                        scope.zcontactLength++;
                        scope.allContacts--;
                        cmNotify.message(gettextCatalog.getString("Removed {{to}}", {to: contact.to}), "success");
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("{{to}} has not been removed", {to: contact.to}), "error");
                    });

                };

                /**
                 * @ngdoc function
                 * @name removeGroupRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Number} idx Array index
                 * @param {Object} group Object to delete
                 * @description
                 * Remove group in API and arrray
                 */
                scope.removeGroupRecipient = function(idx, group) {
                    /*
                     * Get url members
                     */
                    var arrUrl = recipientsMessage.extractUrl(group.members);
                    var count = arrUrl.length;
                    /*
                     * Delete contacts
                     */
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        if(!scope.viewMode) {
                            recipientsMessage.findElement(zimbra.groups, group, "id");
                        }else {
                            recipientsMessage.findElement(zimbra.tree, group, "id");
                        }
                        recipientsMessage.deleteContact(idx, scope.groupsTable);
                        scope.allContacts -= count;
                        scope.groupLength++;
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed group {{group}} (1 recipient)", "Removed group {{group}} ({{$count}} recipients)", {group: group.name}), "success");
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc function
                 * @name removeDlistRecipient
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Number} idx Array index
                 * @param {Object} group Object to delete
                 * @description
                 * Remove distribution list in API and arrray
                 */
                scope.removeDlistRecipient = function(idx, dl) {
                    /*
                     * Get url members
                     */
                    var arrUrl = recipientsMessage.extractUrl(dl.members);
                    var count = arrUrl.length;
                    /*
                     * Delete contacts
                     */
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        recipientsMessage.findElement(zimbra.dls, dl, "id");
                        recipientsMessage.deleteContact(idx, scope.dlsTable);
                        scope.allContacts -= count;
                        scope.dlLength++;
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed list {{list}} (1 recipient)", "Removed list {{list}} ({{$count}} recipients)", {list: dl.name}), "success");
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc function
                 * @name removeAllContactRecipients
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} contacts Object to delete
                 * @description
                 * Remove all contacts selected in API and array
                 */
                scope.removeAllContactRecipients = function(contacts) {
                    var arrUrl = recipientsMessage.extractUrl(contacts);
                    var count = arrUrl.length;
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        scope.contactsTable = [];
                        if(!scope.viewMode) {
                            _.forOwn(contacts, function(v, k) {
                                recipientsMessage.findElement(zimbra.contacts, v, "source_ref");
                            });
                        }else {
                            _.forOwn(contacts, function(v, k) {
                                recipientsMessage.findElement(zimbra.tree, v, "source_ref");
                            });
                        }
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed 1 recipient", "Removed {{$count}} recipients", {}), "success");
                        scope.allContacts -= count;
                        $rootScope.recipientSpinner = false;
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc function
                 * @name removeAllGroupRecipients
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} groups Object to delete
                 * @description
                 * Remove all groups selected in API and array
                 */
                scope.removeAllGroupRecipients = function(groups) {
                    var arrUrl = [];
                    _.forOwn(groups, function(v, k) {
                        arrUrl = arrUrl.concat(recipientsMessage.extractUrl(v.members));
                    });
                    var count = arrUrl.length;
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        scope.groupsTable = [];
                        if(!scope.viewMode) {
                            _.forOwn(groups, function(v, k) {
                                recipientsMessage.findElement(zimbra.groups, v, "id");
                            });
                        }else {
                            _.forOwn(groups, function(v, k) {
                                recipientsMessage.findElement(zimbra.tree, v, "id");
                            });
                        }
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed 1 recipient", "Removed {{$count}} recipients", {}), "success");
                        scope.allContacts -= count;
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /**
                 * @ngdoc function
                 * @name removeAllDlistRecipients
                 * @methodOf recipientsZimlet.directive:cmRecipientsZimlet
                 * @param {Array} dls Object to delete
                 * @description
                 * Remove all distributions list selected in API and array
                 */
                scope.removeAllDlistRecipients = function(dls) {
                    var arrUrl = [];
                    _.forOwn(dls, function(v, k) {
                        arrUrl = arrUrl.concat(recipientsMessage.extractUrl(v.members));
                    });
                    var count = arrUrl.length;
                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        scope.dlsTable = [];
                        _.forOwn(dls, function(v, k) {
                            recipientsMessage.findElement(zimbra.dls, v, "id");
                        });
                        cmNotify.message(gettextCatalog.getPlural(count, "Removed 1 recipient", "Removed {{$count}} recipients", {}), "success");
                        scope.allContacts -= arrUrl.length;
                    }, function(error) {
                        $log.error(error);
                    });
                };

            }
        };

    };

    module.exports = directive;
}());
