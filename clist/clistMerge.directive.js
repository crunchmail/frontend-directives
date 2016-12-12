
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $filter) {

        return {
            templateUrl:'views/clist/clistMerge.html',
            restrict: 'E',
            scope: {
                'onSuccess': '&onSuccess',
                'onError': '&onError',
                'clistList': '='
            },
            controller: function($scope)
            {
                $scope.form = {
                    name: $scope.clistList[0].name
                };

                $scope.mergeClist = function(clistList, form) {
                    return apiClist.merge(form.name, clistList).then(function(result) {
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
