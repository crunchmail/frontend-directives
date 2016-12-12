/**
 * @ngdoc directive
 * @name domains.directive:cmEditDomain
 * @scope
 * @param {Object} domain Passing the domain object
 * @param {Function} onCancel The cancel function from ngDialog
 * @description
 * Show a form to update a domain
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires domains.factory:apiDomains
 * @requires _factory.factory:cmNotify
 * @requires gettextCatalog
 * @requires Lodash
 */
(function () {
    'use strict';

    var directive = function(apiDomains, _, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/domains/editDomain.html',
            scope: {
                "domain": "=",
                "onCancel": "&"
            },
            controller: function($scope) {
                $scope.cloneDomain = _.cloneDeep($scope.domain);
                /**
                 * @ngdoc function
                 * @name updateDomain
                 * @methodOf domains.directive:cmEditDomain
                 * @description
                 * Update a domain
                 */
                $scope.updateDomain = function() {
                    apiDomains.update($scope.cloneDomain.url, $scope.cloneDomain).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your domain has been udpated"), "success");
                        $scope.domain = result.data;
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your domain hasn't been udpated"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @name close
                 * @methodOf domains.directive:cmEditDomain
                 * @description
                 * Close the dialog
                 */
                $scope.close = function(e) {
                    e.preventDefault();
                    $scope.onCancel();
                };
            }
        };
    };

    module.exports = directive;

}());
