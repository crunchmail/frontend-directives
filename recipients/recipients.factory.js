/**
 * @ngdoc service
 * @name recipients.factory:recipientsMessage
 * @description
 * Utils for recipients
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://github.com/likeastore/ngDialog
 * @requires _factory.factory:globalFunction
 * @requires Lodash
 */
(function () {
    'use strict';

    var factory = function($log, _, globalFunction, ngDialog, $rootScope){
        return {
            oldIndexSaved: [],
            groupsContactTotal: 0,
            contactsTotal: 0,
            dlTotal: 0,
            csvName: "",
            mailRegexp: /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Passing arr with recipients
             * @name selectedContact
             * @description
             * Get selected contact
             */
            selectedContact: function(arr) {
                var result = [];
                _.omit(_.map(arr, function(ctc) {
                    if(_.has(ctc, "selected") && ctc.selected && !ctc.isHidden) {
                        result.push(ctc);
                    }
                }), _.isUndefined);

                _.forOwn(arr, function(v, k) {
                    v.selected = false;
                });

                return result;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Number} idx Array index
             * @param {Object} item Item object
             * @param {Array} arr Passing recipients array
             * @name selectItem
             * @description
             * Select/Deselect item
             */
            selectItem: function(idx, item, arr) {
                item.selected = !item.selected;
                var lastIndex = this.returnLastIndex(idx);
                if($rootScope.keyboardClasses !== "") {
                    this.multipleSelect(arr, idx);
                }
                this.oldIndexSaved.push(idx);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Number} idx Array index
             * @param {Array} arr Passing recipients array
             * @name multipleSelect
             * @description
             * Multi selection for recipients
             */
            multipleSelect: function(arr, index) {
                var lastIndex = this.returnLastIndex(index);
                var arrContactsSelected = [];
                /*
                * Check if down or up selection
                */
                if(lastIndex > index) {
                    arrContactsSelected = arr.slice(index, lastIndex);
                }else {
                    arrContactsSelected = arr.slice(lastIndex, index + 1);
                }

                _.forOwn(arrContactsSelected, function(value, key) {
                    value.selected = true;
                });
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Number} idx Array index
             * @name returnLastIndex
             * @description
             * Utils function to return the last index saved
             */
            returnLastIndex: function(index) {
                var lastIndex = this.oldIndexSaved[this.oldIndexSaved.length - 1];
                return lastIndex;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} obj Object with data
             * @param {Object} result Use for recursive function
             * @name recursiveFilterTreeContacts
             * @description
             * Recursive function to return tree contacts
             */
            recursiveFilterTreeContacts: function(obj, result) {
                var main = this;
                _.forOwn(obj, function(v, k) {
                    if(_.size(v.contacts) > 0) {
                        _.forOwn(v.contacts, function(vv, kk) {
                            if(!_.isEmpty(vv)) {
                                result.contacts.push(vv);
                            }
                        });
                    }
                    if(_.size(v.groups) > 0) {
                        _.forOwn(v.groups, function(vvv, kkk) {
                            if(!_.isEmpty(vvv)) {
                                result.groups.push(vvv);
                            }
                        });
                    }
                    if(_.size(v._subfolders) > 0) {
                        main.recursiveFilterTreeContacts(v._subfolders, result);
                    }
                });
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} obj Object with data
             * @name filterContacts
             * @description
             * Filter contact depend of recursiveFilterTreeContacts
             */
            filterContacts: function(obj) {
                var treeObjFilter = {
                    "contacts": [],
                    "groups": []
                };
                this.recursiveFilterTreeContacts(obj, treeObjFilter);
                return treeObjFilter;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} obj Object with data
             * @param {String} key Key
             * @name findDeep
             * @description
             * Utils function to find deep object
             */
            findDeep: function(obj, key) {
                var main = this;
                if (_.has(obj, key)) {
                    return [obj];
                }

                return _.flatten(_.map(obj, function(v) {
                    return typeof v === "object" ? main.findDeep(v, key) : [];
                }), true);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} source Object with data
             * @param {Object} item Object to find in source
             * @param {String} type Type to find ex: source_ref
             * @name findElement
             * @description
             * return a element to disable selected, isHidden and isTagged
             */
            findElement: function(source, item, type) {
                $log.debug(source);
                $log.debug(item);
                $log.debug(type);
                var arrSourceRef = this.findDeep(source, type);
                var result = _.find(arrSourceRef, function(obj) {
                    if(obj[type] === item[type]) {
                        return obj;
                    }
                });
                result.selected = false;
                result.isHidden = false;
                result.isTagged = false;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} inArr Data collection
             * @name groupByRef
             * @description
             * Group by source_ref
             */
            groupByRef: function(inArr) {
                var outArr = [];
                var keys = [];
                var groupedByRef = _.groupBy(inArr, "source_ref");
                return groupedByRef;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Number} idx array index
             * @param {Array} arr Data collection
             * @name deleteContact
             * @description
             * Delete contact in array
             */
            deleteContact: function(idx, arr) {
                arr.splice(idx, 1);
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} v value
             * @param {Array} k key
             * @name removeSelected
             * @description
             * Remove a selected contact
             */
            removeSelected: function(v, k) {
                v[0].selected = false;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} v value
             * @param {Array} k key
             * @name removeSelectedDlGroup
             * @description
             * Remove a selected contact in distribution list
             */
            removeSelectedDlGroup: function(v, k) {
                v.selected = false;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} contact Recipient to prepare
             * @param {String} url API url
             * @name prepareSingleContact
             * @description
             * Prepare a single recipient to post to API
             */
            prepareSingleContact: function(contact, url) {
                var contactJson = {
                    "to": contact.email,
                    "message": url,
                    "source_ref": contact.source_ref,
                    "source_type": contact.source_type,
                    "properties": contact.properties
                };
                if(_.has(contact, "source")) {
                    contactJson.source = contact.source;
                }
                return contactJson;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Recipient array
             * @param {String} url API url
             * @name prepareContact
             * @description
             * Prepare multiple recipients to post to API
             */
            prepareContact: function(arr, url) {
                var arrPrepared = [];
                var contactPrepared = [];
                var main = this;
                _.forOwn(arr, function(v, k) {
                    var contactJson = main.prepareSingleContact(v, url);
                    arrPrepared.push(contactJson);
                });

                return arrPrepared;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arrPrepared array Converted to post to Api
             * @param {Array} initArr original array
             * @param {Function} callback Callback function to post to API
             * @param {Array} headerCsv header csv for csv recipients
             * @name checkDuplicate
             * @description
             * Check if we have duplicate in array
             */
            checkDuplicate: function(arrPrepared, initArr, callback, headerCsv) {
                var main = this;
                var arrSeparated = main.getDuplicate(arrPrepared, headerCsv);
                if(arrSeparated.duplicate.length > 0) {
                    main.showDuplicatesDialog(arrSeparated.duplicate, function(results) {
                        ngDialog.closeAll();
                        //$log.debug(results);
                        for(var u = 0; u < results.length; u++) {
                            arrSeparated.uniq.push(results[u]);
                        }
                        callback(arrSeparated.uniq, initArr);
                    });
                }else {
                    callback(arrSeparated.uniq, initArr);
                }
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr array Converted to post to Api
             * @param {Array} headerCsv header csv for csv recipients
             * @name getDuplicate
             * @description
             * Separate single contact and duplicate to display to user
             */
            getDuplicate: function(arr, headerCsv) {
                if(_.isUndefined(headerCsv)) {
                    headerCsv = [];
                }
                var duplicateObjects = {
                    "duplicate": [],
                    "uniq": []
                };
                var arrGrouped = _.groupBy(arr, "to");
                _.forOwn(arrGrouped, function(v, k) {
                    if(v.length > 1) {
                        for(var d = 0; d < v.length; d++) {
                            /**
                             * Check if empty value
                             */
                            if(v[d].to !== "") {
                                /**
                                 * Check if we have one column, take the first
                                 */
                                if(headerCsv.length === 1) {
                                    duplicateObjects.uniq.push(v[d][0]);
                                }else {
                                    duplicateObjects.duplicate.push(v[d]);
                                }
                            }
                            else {
                                $log.warn("error :");
                                $log.warn(v[d]);
                            }
                        }
                    }else {
                        duplicateObjects.uniq.push(v[0]);
                    }
                });
                $log.debug(duplicateObjects);
                return duplicateObjects;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {String} email Email
             * @name cleanEmail
             * @description
             * Util function to clean an email
             */
            cleanEmail: function(email) {
                var spaceRegex = /\s/g;
                email = email.replace(spaceRegex, "");
                return email;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} item Passing item
             * @param {String} url Passing API url
             * @name prepareSingleManualContact
             * @description
             * Prepare a manual contact to post to API
             */
            prepareSingleManualContact: function(item, url) {
                var contact = {
                    "to": item,
                    "message": url,
                    "source_ref": "",
                    "source_type": "manual",
                    "properties": {}
                };
                return contact;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} item Passing item
             * @param {String} url Passing API url
             * @name prepateSingleContactCsv
             * @description
             * Prepare a csv contact to post to API
             */
            prepateSingleContactCsv: function(item, url) {
                var main = this;
                var checkArobase = /@/g;
                var specialChar = /[^\w\s]/g;
                var contactCsv = {
                    "to": "",
                    "message": url,
                    "properties": {}
                };
                var csvNameStripped = "";
                if(!_.isUndefined(main.csvName)) {
                    csvNameStripped = main.csvName.replace(/[^\w]|[\s]/gi, '_');
                }
                _.forOwn(item, function(v, k) {
                    if(!_.isUndefined(v) && typeof(v) === "string") {
                        // $log.debug("defined");
                        // $log.debug(v);
                        /*
                         * First remove whitespace
                         */
                        v.trim();
                        /*
                         * Check if it's a real email
                         */

                        if(main.mailRegexp.test(v) && v !== "") {
                            contactCsv.to = v;
                        }else if (v !== ""){
                            /*
                             * Contain a @ and spaces
                             * ex : test example@test.com
                             */
                            if(checkArobase.test(v)) {
                                var emailCleaned = main.cleanEmail(v);
                                if(emailCleaned !== "") {
                                    contactCsv.to = emailCleaned;
                                }
                            }else {
                                /*
                                 * else it's properties
                                 */
                                if(k !== "$$hashKey" && !specialChar.test(v)) {
                                    contactCsv.properties[k.toUpperCase()] = v;
                                }
                            }
                        }else {
                            $log.warn("error csv : " + v);
                        }

                        contactCsv.source_type = "csv";
                        contactCsv.source_ref = csvNameStripped + ":" + globalFunction.generateUUID();
                    }else {
                        $log.warn("Error csv");
                        $log.warn(item);
                    }
                });
                return contactCsv;

            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Passing array with csv recipients
             * @param {String} url Passing API url
             * @name prepateSingleContactCsv
             * @description
             * Prepare multiple csv contact to post to API
             */
            prepateCsvContacts: function(arr, url) {
                var main = this;
                var csvArrPrepared = [];
                for(var c = 0; c < arr.length; c++) {
                    var csvContactPrepared = main.prepateSingleContactCsv(arr[c], url);
                    csvArrPrepared.push(csvContactPrepared);
                }
                return csvArrPrepared;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} list Passing contact list object from API
             * @param {Array} arr Passing array with recipients
             * @param {String} url Passing API url
             * @name prepareClistContacts
             * @description
             * Prepare Contact list recipient to post to API
             */
            prepareClistContacts: function(list, arr, url) {
                var arrPrepared = {
                    "name": list.name,
                    "contacts": []
                };

                _.forOwn(arr, function(v, k) {
                    var contactClist = {
                        "to": v.address,
                        "message": url,
                        "properties": v.properties,
                        "source_type": "clist",
                        "source_ref": list.url
                    };

                    arrPrepared.contacts.push(contactClist);
                });
                return arrPrepared;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Passing array with recipients
             * @name addSourceMembers
             * @description
             * To each members in Distribution list, add a source
             */
            addSourceMembers: function(arr) {
                var members = [];
                _.forOwn(arr, function(v, k) {
                    var source = v.email;
                    if(_.has(v, "name")) {
                        source = v.name;
                    }
                    for(var m = 0; m < v.members.length; m++) {
                        v.members[m].source = source;
                        members.push(v.members[m]);
                    }
                    //$scope.dlsTable.push(v);
                });
                return members;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} errors Validations errors collection from API
             * @name contactsValidationsError
             * @description
             * Return a string with all validations errors from API
             */
            contactsValidationsError: function(errors) {
                var messageErrors = "";
                _.forOwn(errors, function(v, k) {
                    _.forOwn(v, function(vv, kk) {
                        messageErrors += k + " : " + vv + '<br/>';
                    });
                });
                return messageErrors;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Object} errors Duplicates errors collection from API
             * @name contactsDuplicatesError
             * @description
             * Return a string with all duplicates errors from API
             */
            contactsDuplicatesError: function(errors) {
                var messageErrors = "";
                for(var e = 0; e < errors.length; e++) {
                    messageErrors += errors[e] + " : already present<br/>";
                }
                return messageErrors;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Duplicates recipients array
             * @param {Function} callback Callback function
             * @name showDuplicatesDialog
             * @description
             * Display the duplicate dialog for the user
             */
            showDuplicatesDialog: function(arr, callback) {
                return ngDialog.openConfirm({
                    plain: true,
                    className: 'ngdialog-theme-default w80-ngdialog',
                    template: '<cm-recipients-duplicate duplicate="arrDuplicate" callback="callbackFct(arg)" on-success="closeThisDialog()"></cm-recipients-duplicate>',
                    controller: function($scope) {
                        $scope.arrDuplicate = arr;
                        $scope.callbackFct = function(arg) {
                            callback(arg);
                        };
                    }
                });
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {String} key Array key
             * @param {Array} arr Array
             * @name returnResultToInsertOrHide
             * @description
             * Find the correct result to insert or hide
             */
            returnResultToInsertOrHide: function(key, arr) {
                var result;
                if(typeof arr !== "object") {
                    result = _.find(arr, function(item) {
                        if(item.name === key || item.email === key) {
                            return item;
                        }
                    });
                }else {
                    result = arr;
                }
                return result;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @param {Array} arr Array
             * @name extractUrl
             * @description
             * Return an array with url
             */
            extractUrl: function(arr) {
                var arrUrl = [];
                $log.debug(arr);
                _.forOwn(arr, function(v, k) {
                    if(_.has(v, "url")) {
                        arrUrl.push(v.url);
                    }
                });
                return arrUrl;
            },
            /**
             * @ngdoc function
             * @methodOf recipients.factory:recipientsMessage
             * @name hideSpinner
             * @description
             * Shortcut for hide the spinner
             */
            hideSpinner: function() {
                $rootScope.recipientSpinner = false;
            },
        };
    };

    module.exports = factory;
}());
