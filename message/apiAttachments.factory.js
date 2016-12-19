/**
 * @ngdoc service
 * @name message.factory:apiAttachments
 * @description attachments factory
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 */
(function () {
    'use strict';

    var factory = function($log, $http, $rootScope){
        return {
            /**
             * @ngdoc function
             * @methodOf message.factory:apiAttachments
             * @name post
             * @description post an attachment to API
             * @param {File} file passing file from input file
             * @param {String} urlMessage url to post attachment
             */
            post: function(file, urlMessage) {
                var fd = new FormData();
                fd.append("file", file);
                fd.append("message", urlMessage);
                return $http.post($rootScope.attachments, fd, {
                    headers: {'Content-Type': undefined },
                    transformRequest: angular.identity
                });
            },
            /**
             * @ngdoc function
             * @methodOf message.factory:apiAttachments
             * @name delete
             * @param {String} url url to delete attachment
             * @description delete a attachment
             */
            delete: function(url) {
                return $http.delete(url);
            }
        };
    };

    module.exports = factory;
}());
