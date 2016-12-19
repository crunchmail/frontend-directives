/**
 * @ngdoc service
 * @name _factory.factory:tokenHandler
 * @description
 * Session storage to save item
 */
(function () {
    'use strict';

    var factory = function($interval, $http, appSettings, jwtHelper, cmNotify,
    $log, $location, $window, base64, $timeout, $rootScope, gettextCatalog,
    sessionStorageService) {
        //var authTokenUrl = appSettings.apiUrl+'api-token-auth/';
        var refreshTime = 150000;
        return {
            /**
             * @ngdoc function
             * @name setHeader
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Set request header with JWT token
             * @param {String} token Api token
             */
            setHeader: function(token) {
                $http.defaults.headers.common.Authorization = 'JWT ' + token;
            },
            /**
             * @ngdoc function
             * @name removeHeader
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Remove request header
             */
            removeHeader: function() {
                $http.defaults.headers.common.Authorization = "";
            },
            /**
             * @ngdoc function
             * @name isValidToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Check if exist/undefined/expired, regenerate a new and launch refresh function
             */
            isValidToken: function() {
                var token = this.getToken();
                if(token !== undefined && token !== null) {
                    $log.debug(token);
                    var date = jwtHelper.getTokenExpirationDate(token);
                    $log.debug("getTokenExpirationDate");
                    $log.debug(date);
                    if(!jwtHelper.isTokenExpired(token)) {
                        this.setHeader(token);
                        $log.debug("it's a valid Token");
                        return true;
                    }else {
                        if(appSettings.source !== "Zimlet") {
                            cmNotify.message(gettextCatalog.getString('Your session has expired'), "error");
                        }
                        this.deleteToken();
                        return false;
                    }
                }else {
                    $log.debug("it's not a valid Token");
                    return false;
                }
            },
            /**
             * @ngdoc function
             * @name saveToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Save the Token in sessionStorage then set the request header
             * @param {String} token Api token
             */
            saveToken: function(token) {
                sessionStorageService.set("token", token);
                this.setHeader(token);
            },
            /**
             * @ngdoc function
             * @name deleteToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * delete the Token from sessionStorage, remove the request header and return to login page
             */
            deleteToken: function() {
                sessionStorageService.remove("token");
                $http.defaults.headers.common.Authorization = '';
                $location.path('/');
            },
            /**
             * @ngdoc function
             * @name getFirstToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Init the first Token
             * @param {String} apiKey User api key
             */
            getFirstToken: function(apiKey) {
                //$http.defaults.headers.common.Authorization = 'Basic ' + base64.encode("api:" + appSettings.apiKey);
                var main = this;
                $log.debug("getFirstToken");
                var apiKeyObj = {
                    "identifier": "api",
                    "password": apiKey
                };
                return $http.post($rootScope.authToken, apiKeyObj);
            },
            /**
             * @ngdoc function
             * @name getToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Return the token
             */
            getToken: function() {
                return sessionStorageService.get("token");
            },
            /**
             * @ngdoc function
             * @name getNewToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Renew a api token
             */
            getNewToken: function(token) {
                return $http({
                    url: $rootScope.refreshToken,
                    // This makes it so that this request doesn't send the JWT
                    skipAuthorization: true,
                    method: 'POST',
                    data : {
                        token:token
                    },
                    headers : {
                        'Content-Type': 'application/json'
                    }
                }).then(function(result){
                    return result.data;
                });
            },
            /**
             * @ngdoc function
             * @name refreshToken
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Launch a loop function to refresh the token
             */
            refreshToken: function(token) {
                $log.debug("refresh");
                var main = this;
                // if(refreshPromise !== undefined) {
                //     $interval.cancel(refreshPromise);
                // }
                var refreshPromise = $interval(function() {
                    main.getNewToken(token).then(function(data) {
                        /*
                        * Save in localStorage the new token
                        */
                        main.saveToken(data.token);
                        /*
                        * Assign the new token to refresh
                        */
                        token = data.token;
                        var date = jwtHelper.getTokenExpirationDate(token);
                        $log.debug("getTokenExpirationDate");
                        $log.debug(date);
                    }, function(response) {
                        $log.debug("session expired");
                        cmNotify.message(gettextCatalog.getString('Your session has expired'), "error");
                        /*
                        * remove Token
                        */
                        main.deleteToken();
                        $interval.cancel(refreshPromise);
                    });
                }, refreshTime);
            },
            /**
             * @ngdoc function
             * @name init
             * @methodOf _factory.factory:tokenHandler
             * @description
             * Init token handler
             */
            init: function() {
                var main = this;
                if(main.isValidToken()) {
                    $log.debug("is Valid Token, set the header");
                    var token = this.getToken();
                    /*
                    * Set the header
                    */
                    main.setHeader(token);
                    main.getNewToken(token).then(function(data) {
                        main.setHeader(data.token);
                        main.saveToken(data.token);
                        main.refreshToken(data.token);
                        /*
                        * redirect to dashboard, if login and reset pages
                        */
                        if($location.$$path === "/" || $location.$$path === "/password-reset") {
                            $location.path("/dashboard");
                        }
                    }, function() {
                        /*
                        * Delete if error token (change apiUrl)
                        */
                        main.deleteToken();
                        if($location.$$path !== "/register") {
                            $location.path("/");
                        }
                    });
                }else {
                    if($location.$$path !== "/register") {
                        $location.path("/");
                    }
                }
            }
        };
    };

    module.exports = factory;
}());
