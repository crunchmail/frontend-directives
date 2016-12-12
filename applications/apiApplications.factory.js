/**
 * @ngdoc service
 * @name applications.factory:apiApplications
 * @description
 * APi shortcut for Applications
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($http, $log, $rootScope){
        return {
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name getAllSmtpApp
             * @description
             * Get all stmp applications
             */
            getAllSmtpApp: function() {
                return $http.get($rootScope.urlApplicationsSmtp);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name getAllApiApp
             * @description
             * Get all api applications
             */
            getAllApiApp: function() {
                return $http.get($rootScope.urlApplicationsApi);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name createApi
             * @description
             * Create a new api application
             * @param {Object} data New api data to post to API
             */
            createApi: function(data) {
                return $http.post($rootScope.urlApplicationsApi, data);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name createSmtp
             * @description
             * Create a new smtp application
             * @param {Object} data New smtp data to post to API
             */
            createSmtp: function(data) {
                return $http.post($rootScope.urlApplicationsSmtp, data);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name regen
             * @description
             * Regen smtp or api applications
             * @param {String} url Url to regenerate
             */
            regen: function(url) {
                return $http.post(url);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name udpate
             * @description
             * Update smtp or api applications
             * @param {String} url Url to regenerate
             * @param {Object} data Data to update
             */
            udpate: function(url, data) {
                return $http.put(url, data);
            },
            /**
             * @ngdoc function
             * @methodOf applications.factory:apiApplications
             * @name delete
             * @description
             * Delete smtp or api applications
             * @param {String} url Url to delete
             */
            delete: function(url) {
                return $http.delete(url);
            }
        };
    };

    module.exports = factory;
}());
