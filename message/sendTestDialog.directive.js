/**
 * @ngdoc directive
 * @name message.directive:cmSendTestDialog
 * @description Directive to create a message
 * @restrict E
 * @scope
 * @param {String} urlMessage Message url to call api and launch email test
 * @param {Function} onSuccess success callback function, after the dialog success
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires message.factory:apiMessage
 * @requires _directives.directive:cmNotify
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function($log, apiMessage, cmNotify, gettextCatalog) {
        return {
            scope: {
                "urlMessage": "@",
                "onSuccess": "&"
            },
            restrict: "E",
            templateUrl:'views/message/sendTestDialog.html',
            link: function(scope, element, attrs) {
                /**
                 * @ngdoc property
                 * @name sendTestForm
                 * @propertyOf message.directive:cmSendTestDialog
                 * @description
                 * Init object to send to api
                 */
                scope.sendTestForm = {};

                /**
                 * @ngdoc function
                 * @name sendTest
                 * @methodOf message.directive:cmSendTestDialog
                 * @description
                 * Send the test message to recipients
                 */
                scope.sendTest = function() {
                    var contactTextarea = scope.sendTestForm.emails.split("\n");
                    var mailRegexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    var errorMessage = "";
                    var listMail = "";

                    for(var s = 0; s < contactTextarea.length; s++) {
                        /**
                         * Check email validity and build the mailing list to send
                         */
                        if(mailRegexp.test(contactTextarea[s])) {
                            listMail += contactTextarea[s];
                            if(s !== contactTextarea.length - 1) {
                                listMail += ", ";
                            }
                        }
                        else {
                            cmNotify.message(gettextCatalog.getString("This email contains errors: " + contactTextarea[s]), "error");
                        }
                    }
                    if(listMail !== "") {
                        apiMessage.sendTestMessage(scope.urlMessage, listMail).then(function(result) {
                            cmNotify.message(gettextCatalog.getString('Your message has been sent'), "success");
                            /**
                             * Launch callback function
                             */
                            scope.onSuccess();
                        }, function(){
                            cmNotify.message(gettextCatalog.getString("Your message hasn't been sent"), "error");
                        });
                    }
                };
            }
        };

    };

    module.exports = directive;
}());
