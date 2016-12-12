
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $filter) {

        return {
            templateUrl:'views/clist/clistClone.html',
            restrict: 'E',
            require: '^cmClist',
            scope: {
                'onSuccess': '&onSuccess',
                'onError': '&onError',
                'onCancel': '&onCancel',
                'clist': '='
            },
            controller: function($scope)
            {
                // add / edit contact
                $scope.form   = {};
                $scope.errors = {};

                $scope.cloneClist = function(clist, form) {

                    return apiClist.clone(clist, form.name).then(function(result) {
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
