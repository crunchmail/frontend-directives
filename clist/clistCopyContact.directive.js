
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $filter, _) {

        return {
            templateUrl:'views/clist/clistCopyContact.html',
            restrict: 'E',
            scope: {
                'onSuccess': '&onSuccess',
                'onCancel': '&onCancel',
                'onError': '&onError',
                'clist': '=',
                'contact': '='
            },
            controller: function($scope)
            {
                $scope.form = {};

                // lists
                apiClist.getAll().then(function(data) {
                    _.remove(data.results, { 'url': $scope.contact.list });
                    $scope.clistList = data.results;
                });

                $scope.copyContact = function(form, contact) {

                    apiClist.copyContact(contact, form.clist).then(function(result) {
                        $scope.onSuccess({ result: result });
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
