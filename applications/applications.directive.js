/**
 * @ngdoc directive
 * @name applications.directive:cmApplications
 * @description
 * Directive to display applications
 * @restrict E
 * @requires applications.factory:apiApplications
 * @requires _factory.factory:cmNotify
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires gettextCatalog
 * @requires http://likeastore.github.io/ngDialog
 */

(function () {
    'use strict';

    var directive = function(_, $log, apiApplications, cmNotify, gettextCatalog, ngDialog) {
        return {
            templateUrl:'views/applications/applications.html',
            controller: function($scope) {

                /**
                 * @ngdoc property
                 * @propertyOf applications.directive:cmApplications
                 * @name getApiApp
                 * @description
                 * Init a array which contain all api applications
                 */
                $scope.getApiApp = [];
                /**
                 * @ngdoc property
                 * @propertyOf applications.directive:cmApplications
                 * @name getSmtpApp
                 * @description
                 * Init a array which contain all smtp applications
                 */
                $scope.getSmtpApp = [];
                /**
                 * Get all api applications
                 */
                apiApplications.getAllApiApp().then(function(results) {
                    $scope.getApiApp = results.data.results;
                });
                /**
                 * Get all smtp applications
                 */
                apiApplications.getAllSmtpApp().then(function(results) {
                    $scope.getSmtpApp = results.data.results;
                });

                /**
                 * @ngdoc function
                 * @methodOf applications.directive:cmApplications
                 * @name showDialogApi
                 * @description
                 * Open a ngDialog to create a new api application
                 */
                $scope.showDialogApi = function() {
                    ngDialog.openConfirm({
                        template: '<cm-create-app-api-dialog></cm-create-app-api-dialog>',
                        plain: true
                    }).then(function(result) {
                        $scope.getApiApp.push(result);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf applications.directive:cmApplications
                 * @name showDialogSmtp
                 * @description
                 * Open a ngDialog to create a new smtp application
                 */
                $scope.showDialogSmtp = function() {
                    ngDialog.openConfirm({
                        template: '<cm-create-app-smtp-dialog></cm-create-app-smtp-dialog>',
                        plain: true
                    }).then(function(result) {
                        $scope.getSmtpApp.push(result);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf applications.directive:cmApplications
                 * @name delete
                 * @description
                 * Delete an application
                 */
                $scope.delete = function(url, arr, idx) {
                    apiApplications.delete(url).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your application has been deleted"), "success");
                        arr.splice(idx, 1);
                    }, function(error) {
                        cmNotify.message(gettextCatalog.getString("Your application hasn't been deleted"), "error");
                    });
                };
            }
        };

    };

    module.exports = directive;
}());
