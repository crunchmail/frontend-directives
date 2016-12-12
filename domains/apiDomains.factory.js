/**
 * @ngdoc service
 * @name domains.factory:apiDomains
 * @description
 * Api shortcut for Domains
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($rootScope, $http) {
        return {
            /**
             * @ngdoc function
             * @methodOf domains.factory:apiDomains
             * @name getAll
             * @description
             * Get all domains
             */
            getAll: function() {
                return $http.get($rootScope.domainsapiUrl).then(function(data) {
                    return data.data.results;
                });
            },
            /**
             * @ngdoc function
             * @methodOf domains.factory:apiDomains
             * @name createDomain
             * @description
             * Create a new domain
             * @param {Object} data Passing the object domain
             */
            createDomain: function(data) {
                return $http.post($rootScope.domainsapiUrl, data);
            },
            /**
             * @ngdoc function
             * @methodOf domains.factory:apiDomains
             * @name update
             * @description
             * Update a domain
             * @param {String} url API url
             * @param {Object} data Passing the object domain
             */
            update: function(url, data) {
                return $http.put(url, data);
            },
            /**
             * @ngdoc function
             * @methodOf domains.factory:apiDomains
             * @name delete
             * @description
             * Delete a domain
             * @param {String} url API url
             */
            delete: function(url) {
                return $http.delete(url);
            },
            /**
             * @ngdoc function
             * @methodOf domains.factory:apiDomains
             * @name revalidate
             * @description
             * Revalidate a domain
             * @param {Object} domain Passing the object domain
             */
            revalidate: function(domain) {
                return $http.post(domain._links.revalidate.href);
            }
        };
    };

    module.exports = factory;

}());
