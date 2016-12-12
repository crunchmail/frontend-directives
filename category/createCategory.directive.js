/**
 * @ngdoc directive
 * @name category.directive:cmCreateCategory
 * @description
 * A directive to create a new category
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires gettextCatalog
 * @requires _factory.factory:cmNotify
 * @requires category.factory:apiCategory
 */
(function () {
    'use strict';

    var directive = function($log, apiCategory, cmNotify, gettextCatalog) {
        return {
            templateUrl:'views/category/createCategory.html',
            link: function(scope, element, attrs) {
                scope.category = {};
                /**
                 * @ngdoc function
                 * @name createCategory
                 * @methodOf category.directive:cmCreateCategory
                 * @description
                 * Create a new category
                 */
                scope.createCategory = function() {
                    apiCategory.createCategory(scope.category).then(function(d) {
                        cmNotify.message(gettextCatalog.getString('category created'), "success");
                        scope.confirm(d.data);
                    });
                };
            }
        };

    };

    module.exports = directive;
}());
