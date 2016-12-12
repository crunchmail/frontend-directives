(function () {
    'use strict';

    var directive = function(_, $log, apiClist, recipientsMessage, $timeout,
                             $q, apiRecipient, cmNotify, gettextCatalog, $rootScope) {
        return {
            templateUrl:'views/clist/clistJaw.html',
            controller: function($scope) {
                apiClist.getAll().then(function(data) {
                    $scope.jawClists = data.results;
                });

                function postList(uniqArr, originalArr) {
                    $log.debug(uniqArr);
                    var request = [];
                    var groupByName = _.groupBy(uniqArr, "name");
                    var cloneClist = _.cloneDeep(uniqArr);
                    $log.debug("groupByName");
                    $log.debug(groupByName);
                    _.forOwn(groupByName, function(v, k) {
                        request.push(apiRecipient.bulkPost(v[0].contacts));
                    });
                    var endMessage = "";
                    function resultRequest(arr, it) {

                        _.forOwn(arr, function(v, k) {
                            if(_.size(v.data.validation_errors) > 0) {
                                cmNotify.message('[' + originalArr[it].name + '] ' + recipientsMessage.contactsValidationsError(v.data.validation_errors), "warning", true);
                            }
                            if(v.data.duplicates.length > 0) {
                                cmNotify.message('[' + originalArr[it].name + '] ' + recipientsMessage.contactsDuplicatesError(v.data.duplicates), "warning", true);
                            }
                            if(v.data.results.length > 0) {
                                endMessage += v.data.results.length + gettextCatalog.getString(" contacts of the list ") + originalArr[it].name + gettextCatalog.getString(" have been added") + "</br>";
                            }
                            $scope.allContacts += v.data.results.length;
                            $log.debug("cloneClist");
                            $log.debug(cloneClist[it]);
                            cloneClist[it].contacts = v.data.results;
                            $scope.clistAdded.push(cloneClist[it]);
                            originalArr[it].isHidden = true;
                            $timeout(recipientsMessage.hideSpinner, 500);
                        });
                        cmNotify.message(endMessage, "success");
                    }
                    $q.all(request).then(function(data) {
                        for(var d = 0; d < data.length; d++ ) {
                            resultRequest(data[d], d);
                        }
                    });

                }

                /*
                 * Add selected lists
                 */
                $scope.addListSelected = function(arr) {
                    var result = recipientsMessage.selectedContact(arr);
                    var request = [];
                    _.forOwn(result, function(v, k) {
                        request.push(apiClist.getOne(v.url));
                    });
                    $q.all(request).then(function(results) {
                        var subRequests = [];
                        _.forOwn(results, function(v, k) {
                            subRequests.push(apiClist.getOne(v._links.contacts.href));
                        });
                        var clistsPrepared = [];
                        $q.all(subRequests).then(function(subResults) {
                            _.forOwn(subResults, function(vv, kk) {
                                var clistPrepared = recipientsMessage.prepareClistContacts(result[kk], vv.results, $scope.message.url);
                                clistsPrepared.push(clistPrepared);
                            });
                            postList(clistsPrepared, result);

                        });
                    });
                };

                /*
                 * Add one list
                 */
                $scope.addList = function(list) {
                    apiClist.getOne(list.url).then(function(data) {
                        apiClist.getOne(data._links.contacts.href).then(function(contacts) {
                            var clistPrepared = recipientsMessage.prepareClistContacts(list, contacts.results, $scope.message.url);
                            $log.debug([clistPrepared]);
                            postList([clistPrepared], [list]);
                        });
                    });
                };

                /*
                 * Delete one
                 */
                $scope.deleteClist = function(list, idx) {
                    $log.debug("delete");
                    $log.debug(list);
                    var arrUrl = recipientsMessage.extractUrl(list.contacts);
                    var count = arrUrl.length;

                    $log.debug(arrUrl);

                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        recipientsMessage.findElement($scope.jawClists, list, "name");
                        $scope.clistAdded.splice(idx, 1);
                        cmNotify.message(count + gettextCatalog.getString(" Contacts have been deleted"), "success");
                        $scope.allContacts -= count;
                    }, function(error) {
                        $log.error(error);
                    });
                };

                /*
                 * Delete All
                 */
                $scope.removeAllClistContacts = function(arr) {
                    var arrUrl = [];
                    _.forOwn(arr, function(v, k) {
                        arrUrl = arrUrl.concat(recipientsMessage.extractUrl(v.contacts));
                    });
                    var count = arrUrl.length;

                    apiRecipient.deleteRecipients(arrUrl).then(function(result) {
                        _.forOwn(arr, function(v, k) {
                            recipientsMessage.findElement($scope.jawClists, v, "name");
                        });
                        cmNotify.message(count + gettextCatalog.getString(" Contacts have been deleted"), "success");
                        $scope.allContacts -= count;
                        $scope.clistAdded = [];
                    }, function(error) {
                        $log.error(error);
                    });
                };

                $scope.itemClicked = function (idx, item, arr) {
                    item.selected = !item.selected;
                    var lastIndex = recipientsMessage.returnLastIndex(idx);
                    $log.debug($rootScope.keyboardClasses);
                    if($rootScope.keyboardClasses !== "") {
                        recipientsMessage.multipleSelect(arr, idx);
                    }
                    recipientsMessage.oldIndexSaved.push(idx);
                };

                $scope.checkSelected = function(arr) {
                    var selected = _.groupBy(arr, "selected");
                    if(_.has(selected, "true")) {
                        return false;
                    }else {
                        return true;
                    }
                };

                $scope.checkHide = function(arr) {
                    var hidden = _.groupBy(arr, "isHidden");
                    if(_.size(hidden.true) === _.size($scope.jawClists)) {
                        $scope.showNoListMsg = true;
                        return true;
                    }else {
                        $scope.showNoListMsg = false;
                        return false;
                    }
                };
            }
        };
    };

    module.exports = directive;
}());
