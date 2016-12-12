/**
 * @ngdoc service
 * @name _factory.factory:postMessageHandler
 * @description
 * Post message handler
 * @requires appSettings
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/auto/service/$injector
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires https://docs.angularjs.org/api/ng/service/$window
 * @requires https://docs.angularjs.org/api/ng/service/$q
 */
(function () {
    'use strict';

    var factory = function(appSettings, $rootScope, $log, _, $window, $injector){
        return {
            /**
             * @ngdoc property
             * @propertyOf _factory.factory:postMessageHandler
             * @name model
             * @description
             * Post message model to send or request
             */
            model: {
                "source": appSettings.source,
                "content"  : {}
            },
            /**
             * @ngdoc function
             * @methodOf _factory.factory:postMessageHandler
             * @name responseHandler
             * @description
             * response postMessage
             */
            responseHandler: function(source, content) {
                $log.debug("source : " + source);
                switch (source) {
                    case "Zimlet":
                        var zimletHandler = $injector.get("zimletHandler");
                        zimletHandler.getResponse(content);
                    break;
                    case "Zimbra":
                        $log.debug("Zimbra response");
                        var zimbraHandler = $injector.get("zimbraHandler");
                        zimbraHandler.getResponse(content);
                    break;
                    case "Toothpaste":
                        $log.debug(content);
                        var toothpasteHandler = $injector.get("toothpasteHandler");
                        toothpasteHandler.getResponse(content);
                    break;
                    default:
                        $log.warn("Source not here");
                }
            },
            /**
             * @ngdoc function
             * @methodOf _factory.factory:postMessageHandler
             * @name post
             * @description
             * Post a postMessage
             */
            post: function(data, sender) {
                /*
                * $rootScope.sender is used by angular-post-message
                https://github.com/kylewelsby/angular-post-message
                TODO change this, maybe better solution
                */
                if(!_.isUndefined(sender)) {
                    $rootScope.sender = sender;
                }else {
                    $rootScope.sender = $window.parent;
                }
                /*
                * PostMessage
                */
                this.model.content = data;
                $rootScope.$emit('$messageOutgoing', angular.toJson(this.model));
            },
            /**
             * @ngdoc function
             * @methodOf _factory.factory:postMessageHandler
             * @name init
             * @description
             * Init postMessage to catch message 
             */
            init: function() {
                var main = this;
                $rootScope.$on('$messageIncoming', function (event, data){
                    main.responseHandler(data.source, data.content);
                });

            }
        };
    };

    module.exports = factory;
}());
