/**
 * @ngdoc service
 * @name category.factory:apiCategory
 * @description
 * Api shortcut for Category
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($http, $rootScope){
        return {
            /**
             * @ngdoc function
             * @methodOf category.factory:apiCategory
             * @name getAll
             * @description
             * Get all categories
             */
            getAll: function(config) {
                return $http.get($rootScope.categoriesApiUrl, config);
            },
            /**
             * @ngdoc function
             * @methodOf category.factory:apiCategory
             * @name getOne
             * @param {String} url Api url
             * @param {Object} config passing some params to $http request
             * @description
             * Get one category
             */
            getOne: function(url, config) {
                return $http.get(url, config);
            },
            /**
             * @ngdoc function
             * @methodOf category.factory:apiCategory
             * @name createCategory
             * @param {Object} obj New category to create
             * @param {Object} config passing some params to $http request
             * @description
             * Create a new category
             */
            createCategory: function(obj, config) {
                return $http.post($rootScope.categoriesApiUrl, obj, config);
            },
            /**
             * @ngdoc function
             * @methodOf category.factory:apiCategory
             * @name deleteCategory
             * @param {String} url Api url
             * @param {Object} config passing some params to $http request
             * @description
             * Delete a category
             */
            deleteCategory: function(url, config) {
                return $http.delete(url, config);
            },
            /**
             * @ngdoc function
             * @methodOf category.factory:apiCategory
             * @name update
             * @param {String} url Api url
             * @param {Object} obj Category object to update
             * @param {Object} config passing some params to $http request
             * @description
             * Update a category
             */
            update: function(url, obj, config) {
                return $http.patch(url, obj, config);
            }
        };
    };

    module.exports = factory;
}());
