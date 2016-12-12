/**
 * @ngdoc service
 * @name user.factory:apiUser
 * @description
 * Api shortcut for User
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires _factory.factory:postMessageHandler
 * @requires _factory.factory:apiUrl
 * @requires gettextCatalog
 * @requires appSettings
 */
(function () {
    'use strict';

    var factory = function($http, appSettings, $rootScope, $location, postMessageHandler, apiUrl){
        return {
            /**
             * @ngdoc property
             * @propertyOf user.factory:apiUser
             * @name userInfo
             * @description
             * Init a object for user
             */
            userInfo: {
                "email" :"",
                "secret":"",
                "first_name": "",
                "last_name": ""
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name setInfo
             * @description
             * Set the user information
             * @param {Object} info Passing user API
             */
            setInfo: function(info) {
                this.userInfo.secret = info.secret;
                this.userInfo.email = info.identifier;
                this.userInfo.first_name = info.first_name;
                this.userInfo.last_name = info.last_name;
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name getProfile
             * @description
             * Get profile
             * @param {Object} config Passing $http configuration
             */
            getProfile: function(config) {
                return $http.get($rootScope.profile, config);
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name getApiKey
             * @description
             * Get apiKey
             * @param {Object} config Passing $http configuration
             * @param {Function} callback Callback function
             */
            getApiKey: function(config, callback) {
                var _this = this;
                $http.get($rootScope.profile, config).then(function(result) {
                    var apiKeyObj = {
                        "apiKey": result.data.secret
                    };
                    /*
                     * check if origin is Zimlet to postMessage to Zimbra
                     */
                    if(appSettings.source === "Zimlet") {
                        postMessageHandler.post(apiKeyObj);
                    }
                    _this.setInfo(result.data);
                    appSettings.apiKey = result.data.secret;
                    if($location.$$path === '/') {
                        $location.path('/dashboard');
                    }
                    if(callback !== undefined) {
                        callback();
                    }
                });
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name resetPswd
             * @description
             * Reset password
             * @param {String} mail User email
             */
            resetPswd: function(mail) {
                return $http.post($rootScope.resetPswd, {"email": mail}, {
                    headers: {'Authorization': ''}
                });
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name regenSecret
             * @description
             * Reset secret
             * @param {String} url API url
             */
            regenSecret: function(url) {
                return $http.post(url);
            },
            /**
             * @ngdoc function
             * @methodOf user.factory:apiUser
             * @name register
             * @description
             * Register a new user
             * @param {Object} data Passing user data
             */
            register: function(data) {
                return $http.post($rootScope.register, data);
            }
        };
    };

    module.exports = factory;
}());
