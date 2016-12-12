/**
 * @ngdoc service
 * @name _factory.factory:messageStats
 * @description
 * Message stats calcul
 */
(function () {
    'use strict';

    var factory = function(){
        return {
            /**
             * @ngdoc service
             * @name rateValue
             * @methodOf _factory.factory:messageStats
             * @description
             * Rate calcul, open, optout and click
             */
            rateValue: function(data, type) {
                var rateValue;
                if(data.last_status.delivered > 0) {
                    if(type === "openRate") {
                        rateValue = data.tracking.opened / data.last_status.delivered;
                    }else if(type === "optOutRate") {
                        rateValue = data.optout.total / data.last_status.delivered;
                    }else if(type === "clickRate") {
                        rateValue = data.tracking.clicked.any / data.last_status.delivered;
                    }else {
                        console.warn('error');
                    }
                }else {
                    rateValue = 0;
                }

                return rateValue;
            }

        };
    };

    module.exports = factory;
}());
