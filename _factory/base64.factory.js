/**
 * @ngdoc service
 * @name _factory.factory:base64
 * @description
 * Encode/Decode in base64
 * @requires https://docs.angularjs.org/api/ng/service/$window
 */

(function () {
    'use strict';

    var factory = function($window) {
        return {
            /**
             * @ngdoc function
             * @name encode
             * @methodOf _factory.factory:base64
             * @description
             * Encode data in base64
             * @param {String} data Passing string in native js function btoa
             */
            encode: function(data) {
                return $window.btoa(data);
            },
            /**
             * @ngdoc function
             * @name decode
             * @methodOf _factory.factory:base64
             * @description
             * Encode data in base64
             * @param {String} data Passing string in native js function atob
             */
            decode: function(data) {
                return $window.atob(data);
            }
        };
    };

    module.exports = factory;

}());
