/**
 * @ngdoc service
 * @name _factory.factory:authInterceptor
 * @description
 * Catch all request, response and error api call
 * @requires appSettings
 * @requires https://docs.angularjs.org/api/auto/service/$injector
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$window
 * @requires https://docs.angularjs.org/api/ng/service/$q
 * @requires https://docs.angularjs.org/api/ng/service/$location
 */
(function () {

    'use strict';
    var factory = function($injector, $location, $window, $q, $rootScope, appSettings, $log){
        var xhrCreations = 0;
        var xhrResolutions = 0;

        /**
         * @ngdoc function
         * @name isLoading
         * @methodOf _factory.factory:authInterceptor
         * @return {Boolean} Check if request is taller than resolution (error and response)
         */
        function isLoading() {
            return xhrResolutions < xhrCreations;
        }

        /**
         * @ngdoc function
         * @name updateStatus
         * @methodOf _factory.factory:authInterceptor
         * @description
         * Hide/show spinner
         */
        function updateStatus() {
            $rootScope.spinnerVisible = isLoading();
        }
        return {
            /**
             * @ngdoc function
             * @name request
             * @methodOf _factory.factory:authInterceptor
             * @description
             * Catch api request
             */
            request: function(config) {
                /**
                 * Remove Headers if not a api call
                 */
                var regexp = new RegExp(appSettings.apiUrl);

                if(!regexp.test(config.url)) {
                    delete config.headers.Authorization;
                    delete config.headers.Accept;
                }
                if(config.url.match(/^http/) && !/api-token-refresh/.test(config.url)) {
                    $log.debug(config.url);
                    xhrCreations++;
                    updateStatus();
                }
                if(!/\/upload-store\/images\//.test(config.url) && config.method !== "POST" && !/\/contacts\/lists\//.test(config.url)) {
                    config.headers["Content-Type"] =  "application/json";
                }

                return config || $q.when(config);
            },
            /**
             * @ngdoc function
             * @name requestError
             * @methodOf _factory.factory:authInterceptor
             * @description
             * Catch request error
             */
            requestError: function (rejection) {
                if (rejection.config.url.match(/^http/) && !/api-token-refresh/.test(rejection.config.url)) {
                    xhrResolutions++;
                    updateStatus();
                }
                $log.error('Request error:', rejection);
                return $q.reject(rejection);
            },
            /**
             * @ngdoc function
             * @name response
             * @methodOf _factory.factory:authInterceptor
             * @description
             * Catch response api call
             */
            response: function (response) {
                if(response.config.url.match(/^http/) && !/api-token-refresh/.test(response.config.url)) {
                    xhrResolutions++;
                    updateStatus();
                }
                return response || $q.when(response);
            },
            /**
             * @ngdoc function
             * @name response
             * @methodOf _factory.factory:authInterceptor
             * @description
             * Catch response error
             */
            responseError: function (rejection) {
                /*
                 * Prevent circular dependancies
                 */
                var cmNotify = $injector.get('cmNotify');
                var gettextCatalog = $injector.get('gettextCatalog');

                $log.debug("responseError");

                $log.debug(rejection);

                // only for external requests
                if (rejection.config.url.match(/^http/))
                {
                    if(!/api-token-refresh/.test(rejection.config.url)) {
                        xhrResolutions++;
                        updateStatus();
                    }
                    /*
                     * Setup Raven to catch ajax error
                     */
                    window.Raven.captureException(new Error('HTTP response error'), {
                        extra: {
                            config: rejection.config,
                            status: rejection.status
                        }
                    });
                    switch (rejection.status)
                    {
                        case 400:
                        // cmNotify.error('API_BAD_REQUEST');
                        // do nothing, classic REST code
                        break;
                        case 403:
                        cmNotify.message(gettextCatalog.getString("API Forbidden"), "error");
                        break;
                        case 404:
                        //cmNotify.error('API_NOT_FOUND');
                        // do nothing, classic REST code
                        break;
                        case 500:
                        cmNotify.message(gettextCatalog.getString("API internal error"), "error");
                        break;
                        case 503:
                        cmNotify.message(gettextCatalog.getString("API Offline"), "error");
                        break;
                        default:
                        cmNotify.message(gettextCatalog.getString("Application Error"), "error");
                    }

                }

                return $q.reject(rejection);
            }
        };
    };

    module.exports = factory;
}());
