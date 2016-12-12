/**
 * @ngdoc service
 * @name _factory.factory:infiniteScroll
 * @description
 * Infinite scroll function to get next elements
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$http
 * @requires https://docs.angularjs.org/api/ng/service/$log
 */
(function () {
    'use strict';

    var factory = function(_, $log, $http) {
        return {
            /**
             * @ngdoc property
             * @name nextElements
             * @propertyOf message.factory:apiMessage
             * @description
             * Save the next url to load
             */
            nextElements: null,
            /**
             * @ngdoc property
             * @name isBusy
             * @propertyOf message.factory:apiMessage
             * @description
             * Boolean to disabled infinite scrolling
             */
            isBusy: false,
            /**
             * @ngdoc function
             * @name getNextElements
             * @methodOf message.factory:apiMessage
             * @description
             * Get next element on scroll event with infiniteScroll
             */
            getNextElements: function(arr, callback) {
                var main = this;
                /*
                 * If busy stop infinite scroll
                 */
                if (main.isBusy) {
                    return;
                }
                main.isBusy = true;

                if(!_.isNull(main.nextElements)) {
                    $log.debug(main.nextElements);
                    $http.get(main.nextElements).then(function(result) {
                        if(!_.isNull(result.data.next)) {
                            main.nextElements = result.data.next;
                            main.isBusy = false;
                        }else {
                            main.isBusy = true;
                        }
                        _.forOwn(result.data.results, function(v, k){
                            /*
                             * Push result
                             */
                            arr.push(v);
                            /*
                             * if have callback after load
                             */
                            if(!_.isUndefined(callback)) {
                                callback(v);
                            }
                        });
                    });
                }
            }
        };
    };
    module.exports = factory;
}());
