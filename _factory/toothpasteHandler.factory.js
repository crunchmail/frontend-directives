/**
 * @ngdoc service
 * @name _factory.factory:toothpasteHandler
 * @description
 * Toothpaste handler
 */
(function () {

    'use strict';

    var factory = function($log, _, $location, createMessageFactory, base64, $route){
        return {
            /**
             * @ngdoc function
             * @name getResponse
             * @methodOf _factory.factory:toothpasteHandler
             * @description
             * Get data from Toothpaste
             * @param {Object} data Data from Toothpaste
             */
            getResponse: function(data) {
                _.forOwn(data, function(value, key) {
                    switch (key) {
                        case "urlMessage":
                        if($location.$$path === "/detailmessage/" + base64.encode(value) + "/") {
                            $log.debug("reload");
                            $route.reload();
                        }else {
                            $location.path("/detailmessage/" + base64.encode(value) + "/");
                        }
                        break;
                        case "close":
                        createMessageFactory.closeEditeur();
                        break;
                        default:
                        $log.warn("error data");
                    }
                });
            }
        };
    };

    module.exports = factory;
}());
