/**
 * @ngdoc directive
 * @name domains.directive:cmListDomains
 * @description
 * List a domain
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires domains.factory:apiDomains
 * @requires _factory.factory:cmNotify
 * @requires gettextCatalog
 * @requires Lodash
 */
(function () {
    'use strict';

    var directive = function(apiDomains, _, $log, ngDialog, gettextCatalog, cmNotify) {
        return {
            templateUrl:'views/domains/listDomains.html',
            controller: function($scope) {
                $scope.showFormDomain = [];
                //$scope.getDomains
                apiDomains.getAll().then(function(domains) {
                    $scope.getDomains = domains;
                });

                /**
                 * @ngdoc property
                 * @propertyOf domains.directive:cmListDomains
                 * @name statusLegend
                 * @description
                 * Init legend for domains status
                 */
                $scope.statusLegend = [
                    {
                        "name": gettextCatalog.getString("Domain is valid"),
                        "filter": "ok"
                    },
                    {
                        "name": gettextCatalog.getString("Domain has errors"),
                        "filter": "ko"
                    },
                    {
                        "name": gettextCatalog.getString("Unknown status"),
                        "filter": "unknown"
                    }
                ];

                /**
                 * @ngdoc function
                 * @methodOf domains.directive:cmListDomains
                 * @name showDomainDialog
                 * @description
                 * Display a dialog to create a new domain
                 */
                $scope.showDomainDialog = function() {
                    ngDialog.openConfirm({
                        template: '<cm-create-domain-dialog></cm-create-domain-dialog>',
                        plain: true
                    }).then(function(result) {
                        $scope.getDomains.push(result);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf domains.directive:cmListDomains
                 * @name deleteDomain
                 * @description
                 * Display a dialog to delete a domain
                 * @param {String} url API url
                 * @param {Number} idx Array index to delete the correct element
                 */
                $scope.deleteDomain = function(url, idx) {
                    apiDomains.delete(url).then(function() {
                        cmNotify.message(gettextCatalog.getString('Your domain has been deleted'), "success");
                        $scope.getDomains.splice(idx, 1);
                    }, function(){
                        cmNotify.message(gettextCatalog.getString("Your domain has not been deleted"), "error");
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf domains.directive:cmListDomains
                 * @name revalidateDomain
                 * @description
                 * Display a dialog to delete a domain
                 * @param {Object} domain Passing the object domain
                 */
                $scope.revalidateDomain = function(domain) {
                    apiDomains.revalidate(domain).then(function() {
                        cmNotify.message(gettextCatalog.getString('Domain validation is pending'), "success");
                    }, function() {
                        cmNotify.message(gettextCatalog.getString('Domain validation request failed'), "success");
                    });
                };
            }
        };
    };

    module.exports = directive;

}());
