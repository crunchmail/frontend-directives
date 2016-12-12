/**
 * @ngdoc service
 * @name _factory.factory:cmNotify
 * @description
 * User notifications
 * @requires appSettings
 * @requires Lodash
 * @requires https://docs.angularjs.org/api/ng/service/$log
 */
(function () {
    'use strict';

    var factory = function(appSettings, _, $log) {

        return {
            /**
             * @ngdoc function
             * @name success
             * @methodOf _factory.factory:cmNotify
             * @description
             * Success message for user
             * @param {String} success Message text
             * @param {Boolean} fixed Persist notifications or not
             */
            success: function(message, fixed) {
                this.message(message, 'success', fixed);
            },
            /**
             * @ngdoc function
             * @name warning
             * @methodOf _factory.factory:cmNotify
             * @description
             * Warning message for user
             * @param {String} success Message text
             * @param {Boolean} fixed Persist notifications or not
             */
            warning: function(message, fixed) {
                this.message(message, 'warning', fixed);
            },
            /**
             * @ngdoc function
             * @name error
             * @methodOf _factory.factory:cmNotify
             * @description
             * Error message for user
             * @param {String} success Message text
             * @param {Boolean} fixed Persist notifications or not
             */
            error: function(message, fixed) {
                this.message(message, 'error', fixed);
            },
            /**
             * @ngdoc function
             * @name message
             * @methodOf _factory.factory:cmNotify
             * @description
             * Message for user
             * @param {String} success Message text
             * @param {String} status Message status (error, warning, success)
             * @param {Boolean} fixed Persist notifications or not
             */
            message: function(message, status, fixed) {
                this.rawMessage( message, status, fixed);
            },
            /**
             * @ngdoc function
             * @name rawMessage
             * @methodOf _factory.factory:cmNotify
             * @description
             * Display message for user
             * @param {String} success Message text
             * @param {String} status Message status (error, warning, success)
             * @param {Boolean} fixed Persist notifications or not
             */
            rawMessage: function(message, status, fixed) {
                var successEl = document.querySelectorAll('#notifications .success');
                $log.debug(successEl);
                if(!_.isNull(successEl)) {
                    _.forEach(successEl, function(v, k) {
                        angular.element(v).remove();
                    });
                }
                var notifications = document.getElementById('notifications');
                var textNotif = document.createElement("div");
                textNotif.innerHTML = message;
                status = status ? status : 'success';
                textNotif.classList.add(status);
                notifications.appendChild(textNotif);
                if(fixed !== undefined) {
                    textNotif.classList.add("fixed");
                    textNotif.style.cursor = "pointer";
                    textNotif.addEventListener('click', function() {
                        this.parentNode.removeChild(this);
                    });
                }else {
                    //Remove Messages
                    setTimeout(function() {
                        if(!_.isNull(textNotif.parentNode)) {
                            textNotif.parentNode.removeChild(textNotif);
                        }
                    }, 3000);
                }
            },
        };
    };

    module.exports = factory;
}());
