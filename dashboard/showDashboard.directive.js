/**
 * @ngdoc directive
 * @name dashboard.directive:cmShowDashboard
 * @description
 * A directive to create a new category
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires https://docs.angularjs.org/api/ng/service/$rootScope
 * @requires _factory.factory:infiniteScrollFactory
 * @requires message.factory:apiMessage
 * @requires moment
 * @requires Lodash
 */
(function () {
    'use strict';

    var directive = function(apiMessage, moment, $log, infiniteScrollFactory, $rootScope, _) {
        return {
            templateUrl:'views/dashboard/dashboard.html',
            controller: function($scope) {
                infiniteScrollFactory.nextElements = null;
                infiniteScrollFactory.isBusy = false;
                $scope.infinite = infiniteScrollFactory;
                var controller = this;
                $scope.getMessages = [];
                $scope.noMessage = false;

                /*
                 * Get first Message to add first url nextMessage if exist
                 */
                apiMessage.getAll({
                    params: {
                        "page_size": 10
                    }
                }).then(function(result) {
                    $scope.getMessages = result.data.results;
                    if(!_.isNull(result.data.next)) {
                        infiniteScrollFactory.nextElements = result.data.next;
                    }
                    angular.forEach($scope.getMessages, function(message) {
                        message.dashDate = moment(message.creation_date).format("L");
                    });
                    if($scope.getMessages.length === 0) {
                        $scope.noMessage = true;
                    }
                });



                /**
                 * @ngdoc function
                 * @name next
                 * @methodOf dashboard.directive:cmShowDashboard
                 * @description
                 * Function to get next Message
                 */
                $scope.next = function() {
                    $log.debug("next");
                    infiniteScrollFactory.getNextElements($scope.getMessages);
                };
            }
        };
    };

    module.exports = directive;

}());
