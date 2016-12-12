/**
 * @ngdoc service
 * @name organizations.factory:apiOrganization
 * @description
 * Api shortcut for Organizations
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($rootScope, $http) {
        return {
            /**
             * @ngdoc function
             * @methodOf organizations.factory:apiOrganization
             * @name getAll
             * @description
             * Get all organizations
             */
            getAll: function() {
                return $http.get($rootScope.organizationApiUrl).then(function(data) {
                    return data.data.results;
                });
            },
            /**
             * @ngdoc function
             * @methodOf organizations.factory:apiOrganization
             * @name getChilds
             * @description
             * Get childrens organizations
             * @param {Object} organization Passing the organization object
             */
            getChilds: function(organization) {
                return $http.get(organization._links.children.href).then(function(data) {
                    return data.data;
                });
            },
            /**
             * @ngdoc function
             * @methodOf organizations.factory:apiOrganization
             * @name createOrganization
             * @description
             * Create an organization
             * @param {Object} data The organization object
             */
            createOrganization: function(data) {
                return $http.post($rootScope.organizationApiUrl, data);
            },
            /**
             * @ngdoc function
             * @methodOf organizations.factory:apiOrganization
             * @name update
             * @description
             * Update a organization
             * @param {String} url API url
             * @param {Object} data The organization object
             */
            update: function(url, data) {
                return $http.put(url, data);
            },
            /**
             * @ngdoc function
             * @methodOf organizations.factory:apiOrganization
             * @name inviteUser
             * @description
             * Invite a user
             * @param {String} url API url
             * @param {Object} data The organization object
             */
            inviteUser: function(url, data) {
                return $http.post(url, data);
            }
        };
    };

    module.exports = factory;

}());
