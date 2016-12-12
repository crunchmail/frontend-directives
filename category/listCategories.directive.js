/**
 * @ngdoc directive
 * @name category.directive:cmListCategories
 * @description
 * A directive to list all categories
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires gettextCatalog
 * @requires _factory.factory:cmNotify
 * @requires https://github.com/likeastore/ngDialog
 * @requires category.factory:apiCategory
 */
(function () {
    'use strict';

    var directive = function(apiCategory, ngDialog, $log, cmNotify) {
        return {
            templateUrl:'views/category/listCategories.html',
            link: function(scope, element, attrs) {
                /**
                 * Get categories
                 */
                apiCategory.getAll().then(function(result) {
                    scope.getCategories = result.data.results;
                });

                /**
                 * TODO create a function to archive a category
                 */
                scope.archiveCategory = function(url) {
                    console.log(url);
                };

                /**
                 * @ngdoc function
                 * @name udpateCatName
                 * @methodOf category.directive:cmListCategories
                 * @description
                 * update the category name
                 * @param {String} url The API url
                 * @param {String} name The new category name
                 * @param {Object} cat The category object
                 */
                scope.udpateCatName = function(url, name, cat) {
                    $log.debug("update");
                    var obj = {
                        "name": name
                    };
                    apiCategory.update(url, obj).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your category has been updated"), "success");
                        cat.name = name;
                        cat.showFormCat = false;
                    });
                };

                /**
                 * @ngdoc function
                 * @name createCategory
                 * @methodOf category.directive:cmListCategories
                 * @description
                 * Create a new Category
                 */
                scope.createCategory = function() {
                    return ngDialog.openConfirm({
                        template: '<cm-create-category></cm-create-category>',
                        plain: true
                    }).then(function(new_cat) {
                        scope.getCategories.push(new_cat);
                    });
                };

                /**
                 * @ngdoc function
                 * @name deleteCategory
                 * @methodOf category.directive:cmListCategories
                 * @description
                 * Delete a category
                 */
                scope.deleteCategory = function(url, idx) {
                    apiCategory.deleteCategory(url).then(function() {
                        scope.getCategories.splice(idx, 1);
                        cmNotify.message(gettextCatalog.getString("Your category has been deleted"), "success");
                    }, function() {
                        cmNotify.message(gettextCatalog.getString("Your category hasn't been deleted"), "error");
                    });
                };
            }
        };
    };

    module.exports = directive;
}());
