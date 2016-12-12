(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $routeParams, _, cmNotify, gettextCatalog) {

        return {
            templateUrl:'views/clist/clistContacts.html',
            restrict: 'E',
            require: '^cmClist',
            scope: {
                'cmUrl': '@'
            },
            controller: function($scope)
            {
                // url can be grabbed form url or attribute
                // but attribute as priority
                var url = $scope.cmUrl ? $scope.cmUrl : atob($routeParams.url);

                /**
                 * -----------------------------------------------------------
                 * Scope initialisation
                 * -----------------------------------------------------------
                 */
                $scope.header      = true;
                $scope.controls    = true;
                $scope.pager = {
                    busy: false,
                    next: null
                };

                $scope.clist       = {}; // viewed contact list
                $scope.contactList = []; // list of contact

                // checkbox selection
                $scope.selection = {
                    selected: [],
                    selectall: false
                };

                // forms visibility
                $scope.showAddContact = false;
                $scope.showEditContact = [];

                /**
                 * -----------------------------------------------------------
                 * Updating clist on CRUD events
                 * -----------------------------------------------------------
                 */
                $scope.onAddContact = function(contact)
                {
                    // hide add contact form
                    $scope.showAddContact = false;
                    // udpate clist of contacts
                    $scope.contactList.push(contact);
                };

                $scope.onUpdateContact = function(contact)
                {
                    // hide add contact form
                    $scope.showEditContact[contact.url] = false;

                    // replace existing contact with updated one
                    var i = _.findIndex($scope.contactList, { url: contact.url });
                    $scope.contactList[i] = contact;
                };

                $scope.onUpdateClist = function(clist) {
                    $scope.clist = clist;
                };

                $scope.onDeleteContact = function(contact)
                {
                    cmNotify.message(gettextCatalog.getString("Your contact has been deleted"), "success");
                    _.remove($scope.contactList, { url: contact.url });
                };

                $scope.onDeleteSelectedContacts = function(contacts)
                {
                    cmNotify.message(gettextCatalog.getString("Your contacts have been deleted"), "success");
                    $scope.selection.selected = [];
                    $scope.refresh();
                };

                /**
                 * -----------------------------------------------------------
                 * CRUD methods for the view
                 * -----------------------------------------------------------
                 */

                // loading clist data to the model
                $scope.init = function() {
                    apiClist.getOne(url).then(function(data) {
                        $scope.clist = data;
                        $scope.refresh();
                    });
                };

                $scope.refresh = function()
                {
                    apiClist.getOne($scope.clist._links.contacts.href).then(function(data) {
                        $scope.contactList = data.results;
                        // update pager next url
                        $scope.pager.next = data.next;
                    });
                };

                /**
                 * Infinite scroll triggered
                 *
                 * TODO: factorize in a service, passing array to concat
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
                        $scope.contactList = $scope.contactList.concat(data.results);
                        $scope.pager.busy = false;
                        $scope.pager.next = data.next;
                    });
                };

                $scope.addContact = function()
                {
                    $scope.showAddContact = !$scope.showAddContact;
                };

                $scope.editContact = function(contact) {
                    $scope.showEditContact[contact.url] =
                        ! $scope.showEditContact[contact.url];
                };

                $scope.copyContact = function(contact)
                {
                    $scope.dialogs.copyContact(contact);
                };

                $scope.deleteContact = function(contact) {
                    return apiClist.deleteContact(contact.url).then(function() {
                        $scope.onDeleteContact(contact);
                    });
                };

                $scope.deleteSelectedContacts = function()
                {
                    var contacts = $scope.selection.selected;
                    apiClist.deleteContact(contacts).then(function() {
                        $scope.onDeleteSelectedContacts(contacts);
                    });
                };

                $scope.updateClist = function()
                {
                    apiClist.edit($scope.clist).then(function(data) {
                        $scope.onUpdateClist(data);
                    });
                };

                /**
                 * Check/uncheck all contacts
                 */
                $scope.toggleSelection = function()
                {
                    $scope.selection.selected = $scope.selection.selectall ?
                        $scope.contactList: [];
                };

                $scope.init();

            },
            link: function(scope, element, attrs, ctrl) {
                scope.dialogs = ctrl.dialogs;
            }
        };
    };

    module.exports = directive;

}());
