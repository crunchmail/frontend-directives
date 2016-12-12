// TODO: remove notification from here
(function () {
    'use strict';

    var apiContactQueue = function($http, $rootScope, cmNotify, gettextCatalog){
        return {
            getCQ: function(url, config) {
                return $http.get(url, config);
            },
            getAllForm: function(config) {
                return $http.get($rootScope.contactQueue, config);
            },
            createContactQueue: function(obj, config) {
                return $http.post($rootScope.contactQueue, obj, config);
            },
            updateContactQueue: function(url, obj, config) {
                $http.put(url, obj, config).then(function() {
                    cmNotify.message(gettextCatalog.getString("Your form has been udpated"), "success");
                }, function(){
                    cmNotify.message(gettextCatalog.getString("Your form hasn't been udpated"), "error");
                });
            },
            getPolicies: function(config) {
                return $http.get($rootScope.contactPolicies, config);
            }
        };
    };

    module.exports = apiContactQueue;
}());
