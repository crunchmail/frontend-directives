/**
 * Main directive for contact lists.
 *
 * This has been designed to be used with on of other contact list's
 * sub-directives by using require property in directive definition.
 *
 * The methods defined here are mainly to make the proper call to the
 * apiClist model. Note that we do not manipulate the DOM here. It will be
 * done by subdirectives using the broadcasted events. This way we separate two
 * differents operations (CRUD vs DOM updates).
 *
 * TODO: handle errors
 */
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, ngDialog, _) {

        return {
            restrict: 'E',
            // we only isolate scope on this parent directive
            scope: {},
            controller: function($scope)
            {
                /**
                 * List of methods to open UI dialogs
                 * All dialogs return a promise but there is no way to use
                 * it for fow, you have to broadcast an event in the
                 * corresponding method.
                 *
                 * TODO: templateId
                 * TODO: dialog service?
                 */
                this.dialogs = {

                    /**
                     * Open a dialog to select the list where to copy a contact
                     */
                    copyContact: function(contact)
                    {
                        return ngDialog.openConfirm({
                            plain: true,
                            template: '<cm-clist-copy-contact contact="contact" on-cancel="closeThisDialog()" on-success="confirm(result)"></cm-clist-copy-contact>',
                            controller: function($scope)
                            {
                                $scope.contact = contact;
                            }
                        });
                    },
                    /*
                     * Open form to add a contact list
                     */
                    merge: function(clistList) {
                        return ngDialog.openConfirm({
                            plain: true,
                            template: '<cm-clist-merge clist-list="clistList" on-cancel="closeThisDialog()" on-success="confirm(result)"></cm-clist-merge >',
                            controller: function($scope)
                            {
                                $scope.clistList = clistList;
                            }
                        });
                    },
                    /*
                     * Open form to add a contact list
                     *
                     * FIXME: contacts are not being copied
                     */
                    clone: function(clist) {

                        return ngDialog.openConfirm({
                            plain: true,
                            template: '<cm-clist-clone clist="clist" on-cancel="closeThisDialog()" on-success="confirm(result)"></cm-clist-clone >',
                            controller: function($scope)
                            {
                                $scope.clist = clist;
                            }
                        });

                    },
                    addContact: function(clist, contact) {
                        ngDialog.openConfirm({
                            template: '<cm-clist-add-contact clist="clist" contact="contact" on-cancel="closeThisDialog()" on-success="confirm(result)"></cm-clist-add-contact>',
                            controller: function($scope)
                            {
                                $scope.clist   = clist;
                                $scope.contact = contact;
                            }
                        });
                    },
                    /**
                     * Open a form to create a new contact list propeprty
                     */
                    addProperty: function(clist) {
                        ngDialog.openConfirm({
                            // TODO: missing list
                            template: '<cm-clist-add-property clist="clist" on-cancel="closeThisDialog()" on-success="confirm(result)"></cm-clist-add-property>',
                            controller: function($scope)
                            {
                                $scope.clist = clist;
                            }
                        });
                    }

                };

            }
        };
    };

    module.exports = directive;

}());
