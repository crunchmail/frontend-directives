
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $filter, $log, _) {

        return {
            templateUrl:'views/clist/clistAddProperty.html',
            restrict: 'E',
            require: '^cmClist',
            scope: {
                'onSuccess': '&onSuccess',
                'onCancel': '&onCancel',
                'onError':   '&onError',
                'clist':      '='
            },
            controller: function($scope)
            {
                $scope.types = apiClist.types;
                $scope.form = {};
                $scope.errors = {};

                $scope.addProperty = function(clist, prop) {

                    var clistCopy = angular.copy(clist);

                    // adding the new property on the clist
                    clistCopy.contact_fields.push(prop);

                    // updating current clist
                    if(_.has(clistCopy, "url")) {
                        return apiClist.edit(clistCopy).then(function(newClist) {

                            clist = newClist;

                            $scope.form = {};
                            $scope.onSuccess({ result: newClist.contact_fields });

                        }, function(result) {
                            $scope.errors = $filter('errorFix')(result.data);
                            $scope.onError({ result: result.data });
                        });
                    }else {
                        $scope.onSuccess({ result: clistCopy.contact_fields });
                        $scope.form = {};
                    }
                };
            }
        };
    };

    module.exports = directive;

}());
