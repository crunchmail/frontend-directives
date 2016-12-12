(function () {
    'use strict';

    var directive = function(apiClist, appSettings, cmNotify, _, gettextCatalog, $log) {

        return {
            templateUrl:'views/clist/clistList.html',
            restrict: 'A',
            require: 'cmClist',
            //scope: { },
            controller: function($scope)
            {
                $scope.clistList = [];

                // checkbox selection
                $scope.selection = {
                    selected: [],
                    selectall: false
                };

                $scope.params = {};

                // inifinite scroll params
                $scope.pager = {
                    busy: false,
                    next: null
                };

                $scope.showAddClist = false;
                $scope.showAddContact = [];

                /**
                 * -----------------------------------------------------------
                 * Updating contact list on CRUD events
                 * -----------------------------------------------------------
                 */
                $scope.onAddClist = function(result)
                {
                    // hide add contact form
                    $scope.showAddClist = false;
                    // udpate list of contacts
                    $scope.clistList.push(result);
                };

                $scope.onAddContact = function(result)
                {
                    // hide add contact form
                    $scope.showAddContact[result.contact_list] = false;

                    // count contacts + 1 on the list
                    var e = _.find($scope.clistList , { url: result.contact_list });
                    e.contacts_count += 1;
                };

                $scope.onDeleteClist = function(clist)
                {
                    cmNotify.message(gettextCatalog.getString("Your list has been deleted"), "success");
                    _.remove($scope.clistList, { url: clist.url });
                };

                $scope.onDeleteSelectedClist = function(lists)
                {
                    cmNotify.message(gettextCatalog.getString("Your lists have been deleted"), "success");
                    $scope.selection.selected = [];
                    $scope.refresh();
                };

                $scope.onMergeClist = function(clistList)
                {
                    cmNotify.message(gettextCatalog.getString("Your lists have been merged"), "success");
                    $scope.selection.selected = [];
                    $scope.refresh();
                };

                $scope.onCloneClist = function(clist)
                {
                    cmNotify.message(gettextCatalog.getString("Your lists have been cloned"), "success");
                    $scope.clistList.push(clist);
                };

                /**
                 * -----------------------------------------------------------
                 * UI Methods for the view
                 * -----------------------------------------------------------
                 */

                /**
                 * Check/uncheck all lists
                 */
                $scope.toggleSelection = function()
                {
                    $scope.selection.selected = $scope.selection.selectall ?
                        $scope.clistList : [];
                };

                /**
                 * -----------------------------------------------------------
                 * CRUD methods for the view
                 * -----------------------------------------------------------
                 */

                /**
                 * Refresh list on contact lists with API values
                 */
                $scope.refresh = function()
                {
                    apiClist.getAll({params: $scope.params}).then(function(data) {
                        $scope.clistList = data.results;
                        // update pager next url
                        $scope.pager.next = data.next;

                        /** Generate random clists */
                        /*
                        var arr = [];
                        for (var i=0;i<44;i++)
                        {
                            apiClist.add({
                                name: Math.random().toString(36).substring(5)
                            });
                        }
                       */
                    });
                };

                /**
                 * Infinite scroll triggered
                 *
                 * TODO: factorize in a service
                 */
                $scope.loadNext = function()
                {
                    // you can not load next page while already loading
                    // or not initialized yet
                    if ($scope.pager.busy || !$scope.pager.next)
                    {
                        return false;
                    }

                    $scope.pager.busy = true;

                    apiClist.getOne($scope.pager.next).then(function(data) {
                        $scope.clistList = $scope.clistList.concat(data.results);
                        $scope.pager.busy = false;
                        $scope.pager.next = data.next;
                    });
                };

                // $scope.addClist = function()
                // {
                //     $scope.showAddClist = !$scope.showAddClist;
                // };

                $scope.addContact = function(item)
                {
                    $scope.showAddContact[item.url] = !$scope.showAddContact[item.url];
                };

                $scope.deleteClist = function(clist)
                {
                    apiClist.delete(clist.url).then(function() {
                        $scope.onDeleteClist(clist);
                    }, function(err) {
                        // already deleted
                        if (err.status === 404)
                        {
                            $scope.onDeleteClist(clist);
                            return true;
                        }
                        cmNotify.message(gettextCatalog.getString("Your list has been deleted"), "error");
                    });
                };

                $scope.deleteSelectedClist = function()
                {
                    var lists = $scope.selection.selected;
                    apiClist.delete(lists).then(function() {
                        $scope.onDeleteSelectedClist(lists);
                    }, function(err) {

                        // already deleted, fake confirmation
                        if (err.status === 404)
                        {
                            $scope.onDeleteSelectedClist(lists);
                            return true;
                        }
                        cmNotify.message(gettextCatalog.getString("Your lists hasn't been deleted"), "error");
                    });
                };

                $scope.mergeSelectedClist = function(clistList)
                {
                    return $scope.dialogs.merge(clistList).then(function(result) {
                        $scope.onMergeClist(clistList);
                    });
                };

                $scope.cloneClist = function(clist)
                {
                    return $scope.dialogs.clone(clist).then(function(result) {
                        $scope.onCloneClist(result);
                    });
                };

                $scope.exportClist = function(url)
                {
                    apiClist.export(url).then(function(data) {
                        // hack to download CSV
                        var anchor = angular.element('<a/>');
                        anchor.css({display: 'none'}); // Make sure it's not visible
                        angular.element(document.body).append(anchor); // Attach to document

                        anchor.attr({
                            href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
                            target: '_blank',
                            download: 'contacts.csv'
                        })[0].click();
                        anchor.remove(); // Clean it up afterwards
                    });
                };

                // init
                $scope.refresh();

            }
        };
    };

    module.exports = directive;

}());
