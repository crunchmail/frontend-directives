/**
 * @ngdoc service
 * @name message.factory:messageFilter
 * @description List and return all message status
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var factory = function(gettextCatalog) {
        return {
            /**
             * @ngdoc function
             * @name get
             * @methodOf message.factory:messageFilter
             * @description
             * All message api status
             * ```json
             * [{
             *      "name": "status_name_to_display"
             *      "value": "value_in_api_params"
             *      "filter": "checkbox"
             * }]
             * ```
             * @return {Array} return array with message status object
             */
            get: function() {
                return [
                    {
                        "name": gettextCatalog.getString("Draft"),
                        "value": "status=message_ok",
                        "filter": "message_ok"
                    },
                    {
                        "name": gettextCatalog.getString("Sending"),
                        "value": "status=sending",
                        "filter": "sending"
                    },
                    {
                        "name": gettextCatalog.getString("Sent"),
                        "value": "status=sent",
                        "filter": "sent"
                    },
                    {
                        "name": gettextCatalog.getString("Has errors"),
                        "value": "status=message_issues",
                        "filter": "message_issues"
                    }
                ];
            }
        };
    };

    module.exports = factory;
}());
