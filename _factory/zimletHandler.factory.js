/**
 * @ngdoc service
 * @name _factory.factory:zimletHandler
 * @description
 * Zimlet Handler
 */
(function () {
	'use strict';

	var factory = function(_, $log, $http, base64, appSettings,
    $rootScope, $location, tokenHandler){
        return {
            /**
             * @ngdoc function
             * @name getResponse
             * @methodOf _factory.factory:zimletHandler
             * @description
             * Get response postMessage from Zimlet
             */
            getResponse: function(data) {
                $log.debug(data);
                var main = this;
                _.forOwn(data, function(value, key) {
                    switch (key) {
                        //use ???
                        case "JWT":
                            $log.debug("Toothpaste : JWT");
                            tokenHandler.setHeader(data.JWT);
                            tokenHandler.refreshToken(data.JWT);
                            break;
                        //use ???
                        case "apiKey":
                            $log.debug("Toothpaste : apiKey");
                            main.setHeader(data.apiKey);
                            break;
                        //use ???
                        case "loadTpl":
                            $log.debug('/editeur/'+base64.encode(data.loadTpl));
                            $rootScope.$apply(function() {
                                $location.path('/editeur/'+base64.encode(data.loadTpl));
                            });
                            break;
                        case "htmlPasted":
                            $rootScope.getHtmlPasted = data.htmlPasted;
                            break;
                        case "nameTpl":
                            appSettings.nameTemp = data.nameTpl;
                            break;
                            default:
                            $log.warn("ZimletHandler getResponse data error");
                            $log.warn("key: "+key);
                        }
                    });
                }
            };
        };
    module.exports = factory;
}());
