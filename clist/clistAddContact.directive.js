
(function () {
    'use strict';

    var directive = function(apiClist, cmNotify, appSettings, $filter, _, gettextCatalog, $log) {

        return {
            templateUrl:'views/clist/clistAddContact.html',
            restrict: 'E',
            require: '^cmClist',
            scope: {
                'onSuccess': '&onSuccess',
                'onError': '&onError',
                'onCancel': '&onCancel',
                'clist': '=',
                'contact': '='
            },
            controller: function($scope)
            {
                $log.debug($scope.contact);
                // add / edit contact
                $scope.editing = $scope.contact ? true : false;
                $scope.form = $scope.contact ? angular.copy($scope.contact) : {};
                $scope.errors = {};

                // convert types
                $scope.form = apiClist.convertTypes($scope.clist, $scope.form);

                $scope.addContact = function(clist, contact) {
                    contact.contact_list = clist.url;
                    apiClist.addOrEditContact(contact.url, contact).then(function(data) {
                        $scope.form = {};
                        $scope.onSuccess({ result: data });
                        if ($scope.editing)
                        {
                            cmNotify.message(gettextCatalog.getString("Your contact has been updated"), "success");
                        }
                        else
                        {
                            cmNotify.message(gettextCatalog.getString("Your contact has been created"), "success");
                        }
                    }, function(result) {
                        $scope.errors = $filter('errorFix')(result.data);
                        $scope.onError({ result: result.data });
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
