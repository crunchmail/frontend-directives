/**
 * @ngdoc directive
 * @name _directives.directive:cmChangeLanguage
 * @description
 * Directive to change the application language
 * Not use, because we have only french clients
 * @restrict E
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(gettextCatalog) {
        return {
            restrict: 'E',
            template: '<div class="container-inline"><label for="language">' + gettextCatalog.getString('Language') + '</label><select id="language" ng-model="userLang" ng-change="change()"><option value="en" selected="selected">' + gettextCatalog.getString('English') + '</option><option value="fr">' + gettextCatalog.getString('French') + '</option></select></div>',
            link: function($scope, element, attrs) {
                var browserLanguage = navigator.language;
                if(localStorage.getItem('language')) {
                    var language = localStorage.getItem('language');
                    $scope.userLang = language;
                } else {
                    $scope.userLang = browserLanguage;
                }
                /**
                 * @ngdoc function
                 * @name change
                 * @methodOf _directives.directive:cmChangeLanguage
                 * @description
                 * Change application language
                 */
                $scope.change = function() {

                    var languageSelected = $scope.userLang;
                    localStorage.setItem('language', languageSelected);
                    gettextCatalog.setCurrentLanguage(languageSelected);
                };
            }
        };
    };

    module.exports = directive;

}());
