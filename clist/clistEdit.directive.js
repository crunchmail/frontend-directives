(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $routeParams, _, cmNotify, gettextCatalog, $filter, $log, $location) {

        return {
            templateUrl:'views/clist/clistEdit.html',
            restrict: 'A',
            require: 'cmClist',
            controller: function($scope) {
                $scope.update = false;
                $scope.types = apiClist.types;

                $scope.clist      = {
                    "name": "",
                    "contact_fields": []
                };
                $scope.clist_edit = {};

                $scope.showAddProperty = false;

                $scope.errors = {};

                if(!_.isUndefined($routeParams.url)) {
                    var url = atob($routeParams.url);
                    apiClist.getOne(url).then(function(data) {
                        $scope.clist = data;
                        $scope.update = true;
                    });
                }

                /**
                 * -----------------------------------------------------------
                 * Updating list on CRUD events
                 * -----------------------------------------------------------
                 */

                /**
                 * Executed after adding a contact
                 */
                $scope.onAddProperty = function(result)
                {
                    // hide add contact form
                    $scope.showAddProperty = false;
                    // udpate list of properties
                    $scope.clist.contact_fields = result;

                    // we also need to update the currently edited clist
                    // (we lose current editing)
                    $scope.clist = angular.copy($scope.clist);
                };

                $scope.onCreateList = function(clist) {
                    cmNotify.message(gettextCatalog.getString("Your contact list has been created"), "success");
                };

                $scope.onUpdateList = function(clist) {
                    cmNotify.message(gettextCatalog.getString("Your contact list has been updated"), "success");
                };

                $scope.onDeleteProperty = function(prop) {
                    _.remove($scope.clist.contact_fields, { name: prop.name });
                };

                $scope.checkIfDisabled = function(list) {
                    if(list.name === '') {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                /**
                 * -----------------------------------------------------------
                 * CRUD methods for the view
                 * -----------------------------------------------------------
                 */

                $scope.addProperty = function()
                {
                    $scope.showAddProperty = !$scope.showAddProperty;

                };

                $scope.editClist = function(clist)
                {
                    var request;
                    if($scope.update) {
                        request = apiClist.edit(clist);
                    }else {
                         request = apiClist.add(clist);
                    }
                    request.then(function(result) {
                        $scope.errors = null;
                        // we update the original list
                        $scope.clist  = angular.copy(result);
                        if($scope.update) {
                            $scope.onUpdateList(clist);
                        }else {
                            $scope.onCreateList(clist);
                            $location.path('/contactlists');
                        }

                    }, function(result) {
                        $scope.errors = $filter('errorFix')(result.data);
                    });
                };

                $scope.deleteProperty = function(clist, prop) {
                    apiClist.deleteProperty(clist, prop).then(function() {
                        $scope.errors = null;
                        $scope.onDeleteProperty(prop);

                        // we also need to delete the property on the
                        // currently edited clist
                        $scope.clist.contact_fields.splice(
                                $scope.clist.contact_fields.indexOf(prop),
                                1);
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
