/**
 * @ngdoc service
 * @name recipients.factory:recipientFilter
 * @description
 * Listing all API filters for recipients
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var factory = function(gettextCatalog) {
        return {
            /**
             * @ngdoc function
             * @name getFirstPart
             * @methodOf recipients.factory:recipientFilter
             * @description
             * APi filter : delivered, sending, dropped, bounced, ignored, delayed and unknown
             */
            getFirstPart: function() {
                return [
                    {
                        "name": gettextCatalog.getString("Delivered"),
                        "value": "last_status=delivered",
                        "filter": "delivered"
                    },
                    {
                        "name": gettextCatalog.getString("Sending"),
                        "value": "last_status=sending&last_status=queued",
                        "filter": "sending"
                    },
                    {
                        "name": gettextCatalog.getString("Dropped"),
                        "value": "last_status=dropped",
                        "filter": "dropped"
                    },
                    {
                        "name": gettextCatalog.getString("Bounced"),
                        "value": "last_status=bounced",
                        "filter": "bounced"
                    },
                    {
                        "name": gettextCatalog.getString("Ignored"),
                        "value": "last_status=ignored",
                        "filter": "ignored"
                    },
                    {
                        "name": gettextCatalog.getString("Delayed"),
                        "value": "last_status=delayed",
                        "filter": "delayed"
                    },
                    {
                        "name": gettextCatalog.getString("Unknown"),
                        "value": "last_status=unknown",
                        "filter": "unknown"
                    }
                ];
            },
            /**
             * @ngdoc function
             * @name getSecondPart
             * @methodOf recipients.factory:recipientFilter
             * @description
             * APi filter : opened, clicked
             */
            getSecondPart: function() {
                return [
                    {
                        "name": gettextCatalog.getString("Opened"),
                        "value": "opened=true",
                        "filter": "opened",
                        "secondary": true
                    },
                    {
                        "name": gettextCatalog.getString("Clicked"),
                        "value": "clicked=true",
                        "filter": "clicked",
                        "secondary": true
                    }
                ];
            }
        };
    };

    module.exports = factory;
}());
