/**
 * @ngdoc service
 * @name _factory.factory:apiUrl
 * @description
 * Infinite scroll function to get next elements
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$q
 * @requires appSettings
 * @requires _factory.factory:tokenHandler
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($log, appSettings, $rootScope, $q, tokenHandler, jwtHelper) {
        return {
            /**
             * @ngdoc function
             * @name init
             * @methodOf _factory.factory:apiUrl
             * @description
             * Init all api url use in our application
             */
            init: function(apiUrl) {
                /**
                 * Create a promise
                 */
                return $q(function(resolve, reject) {
                    /*
                     * Set Url api
                     */
                    var apiUrlVersion = apiUrl + appSettings.version + "/";
                    var apiUrlPrivate = apiUrl + "_/";

                    /*
                     * Public
                     */
                    $rootScope.resetPswd = apiUrlVersion + 'auth/password_reset/';
                    $rootScope.authToken = apiUrl + "api-token-auth/";
                    $rootScope.refreshToken = apiUrl + "api-token-refresh/";
                    $rootScope.profile = apiUrlVersion + 'me/';
                    $rootScope.register = apiUrlVersion + 'register/';
                    $rootScope.domainsapiUrl = apiUrlVersion + 'domains/';
                    $rootScope.uploadStore = apiUrlVersion + "upload-store/images/";
                    $rootScope.messages = apiUrlVersion + "messages/";
                    $rootScope.attachments = apiUrlVersion + "attachments/";
                    $rootScope.contacts = apiUrlVersion + "contacts/";
                    $rootScope.contactPolicies = apiUrlVersion + "contacts/policies/";
                    $rootScope.contactQueue = apiUrlVersion + "contacts/queues/";
                    $rootScope.contactList = apiUrlVersion + "contacts/lists/";
                    $rootScope.recipients = apiUrlVersion + "recipients/";
                    $rootScope.categoriesApiUrl = apiUrlVersion + "categories/";
                    $rootScope.organizationApiUrl = apiUrlVersion + "organizations/";
                    $rootScope.urlApplicationsApi = apiUrlVersion + "applications/api/";
                    $rootScope.urlApplicationsSmtp = apiUrlVersion + "applications/smtp/";

                    /*
                     * Private
                     */
                    $rootScope.tplStore = apiUrlPrivate + "template-store/";
                    $rootScope.docFiles = apiUrlPrivate + "template-store/document-files/";
                    $rootScope.docThumbnails = apiUrlPrivate + "template-store/document-thumbnails/";

                    /*
                     * Check token
                     */
                    if(tokenHandler.isValidToken()) {
                        var token = tokenHandler.getToken();
                        tokenHandler.getNewToken(token).then(function(data) {
                            $log.debug("get a new token");
                            tokenHandler.refreshToken(data.token);
                            var date = jwtHelper.getTokenExpirationDate(data.token);
                            $log.debug("getTokenExpirationDate");
                            $log.debug(date);
                            resolve("init done");
                        }, function() {
                            reject("token failed");
                        });
                    }else {
                        reject("token failed");
                    }
                });

            }
        };
    };

    module.exports = factory;

}());
