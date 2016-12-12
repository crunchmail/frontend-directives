/**
 * @ngdoc service
 * @name zimbra.factory:zimbraHandler
 * @description
 * PostMessage response from Zimbra
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$window
 * @requires _factory.factory:tokenHandler
 * @requires zimbra.constant:zimbra
 * @requires appSettings
 * @requires Lodash
 */
(function () {
    'use strict';

    var factory = function($log, zimbra, _, appSettings, tokenHandler, $location, $rootScope, $window){
        return {
            /**
             * @ngdoc function
             * @name protectApiKey
             * @methodOf zimbra.factory:zimbraHandler
             * @description
             * Utils function to protect apiKey
             * @param {String} apiKey API key
             */
            protectApiKey: function(apiKey) {
                var protectedKey = "";
                var last5ApiKey = apiKey.substr(apiKey.length - 5);
                for(var a = 0; a < apiKey.length - 5; a++) {
                    protectedKey += "*";
                }
                protectedKey += last5ApiKey;
                return protectedKey;
            },
            /**
             * @ngdoc property
             * @name groupModel
             * @propertyOf zimbra.factory:zimbraHandler
             * @description
             * Group model
             */
            groupModel: {
                "id": null,
                "title": null,
                "type": null,
                "folder": null,
                "tag": null,
                "contactsGroup": []
            },
            /**
             * @ngdoc property
             * @name contactModel
             * @propertyOf zimbra.factory:zimbraHandler
             * @description
             * Contact model
             */
            contactModel: {
                "id": null,
                "_attrs": {
                    "firstName": null,
                    "lastName": null,
                    "email": null
                }
            },
            /**
             * @ngdoc function
             * @name getResponse
             * @methodOf zimbra.factory:zimbraHandler
             * @description
             * Get postmessage response and init
             * @param {Object} data Postmessage response
             */
            getResponse: function(data) {
                var that = this;
                _.forOwn(data, function(value, key) {
                    switch (key) {
                        case "apiKey":
                            that.apiKeyHandler(data.apiKey);
                        break;
                        case "contacts":
                            /*
                            * reset Contacts
                            TODO maybe not usefull
                            */
                            zimbra.contacts = "";
                            zimbra.groups = [];
                            zimbra.tags = "";
                            zimbra.dls = "";
                            zimbra.zimbraContactId = {};
                            that.contactHandler(data.contacts);
                        break;
                        case "refresh":
                            $log.debug("reload");
                            $window.location.reload();
                        break;
                        default:
                            $log.warn("ZimbraHandler getResponse data error");
                            $log.warn("key: "+key);
                    }
                });
            },
            /**
             * @ngdoc function
             * @name contactHandler
             * @methodOf zimbra.factory:zimbraHandler
             * @description
             * Parsing contact object, and init zimbra components
             * @param {Object} contacts Contacts object from Zimbra
             */
            contactHandler: function(contacts) {
                $log.debug("contactHandler");
                //$log.debug(contacts);
                //$log.debug(JSON.stringify(contacts));
                var main = this;
                function parseContact(contact) {
                    _.forOwn(contact, function(value, key) {
                        if(key === "contacts") {
                            zimbra.contacts = value;
                        }
                        else if(key === "dls") {
                            zimbra.dls = value;
                        }
                        else if(key === "groups") {
                            zimbra.groups = value;
                        }
                        else if(key === "tags") {
                            zimbra.tags = value;
                        }
                        else if(key === "existing") {
                            zimbra.existing = value;
                        }
                        else if(key === "remaining") {
                            zimbra.remaining = value;
                        }
                        else if(key === "tree") {
                            zimbra.tree = value;
                        }
                        else if(key === "timer") {
                            $log.debug("Zimbra contacts fetched in "+value);
                        }
                        else {
                            $log.warn("ZimbraHandler parseContact data error");
                            $log.warn("key: "+key);
                        }
                    });
                }
                var i = 0;
                for(var c = 0; c < contacts.length; c++) {
                    parseContact(contacts[c]);
                    // NOTE: really broadcast on every iteration ???
                    // moved after loop
                    // $rootScope.$broadcast('zimbraContactsCollected', { collectedContact : zimbra });
                }
                $rootScope.$broadcast('zimbraContactsCollected', { collectedContacts : zimbra });
            },
            /**
             * @ngdoc function
             * @name apiKeyHandler
             * @methodOf zimbra.factory:zimbraHandler
             * @description
             * Get apiKey, init new token
             * @param {String} apiKey API key
             */
            apiKeyHandler: function(apiKey) {
                $log.debug("apiKeyHandler");
                var apiKeyProtected = this.protectApiKey(apiKey);
                if(apiKeyProtected !== "") {
                    $log.debug("get apiKey " + apiKeyProtected);
                }else {
                    $log.debug("apiKey empty");
                }
                /*
                * Check if apiKey is empty...
                */
                if(tokenHandler.isValidToken()) {
                    $log.debug("Launch tokenHandler");
                    tokenHandler.init();
                }else if(apiKey !== "") {
                    appSettings.apiKey = apiKey;
                    tokenHandler.getFirstToken();
                    /*
                    * get apiKey and postMessage to Parent
                    */
                }else {
                    $location.path("/");
                }
            }
        };
    };

    module.exports = factory;
}());
