/**
 * @ngdoc directive
 * @name message.directive:cmAttachments
 * @description Directive to display attachments
 * @restrict E
 * @requires https://docs.angularjs.org/api/ng/service/$log
 * @requires cmNotify.factory:cmNotify
 * @requires https://docs.angularjs.org/api/ng/service/$sce
 * @requires https://docs.angularjs.org/api/ng/service/$timeout
 * @requires globalFunction.factory:globalFunction
 * @requires apiMessage.factory:apiMessage
 */

(function () {
    'use strict';

    var directive = function($log, cmNotify, gettextCatalog, $sce, $timeout, globalFunction) {
        return {
            templateUrl:'views/message/_attachments.html',
            require: "^cmMessageDetails",
            link: function (scope, element, attributes, ctrl) {
                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmAttachments
                 * @name to_trusted
                 * @description convert to executable html with trustAsHtml
                 */
                scope.to_trusted = function(html_code) {
                    return $sce.trustAsHtml(html_code);
                };
                /**
                 * @ngdoc property
                 * @name modelInput
                 * @propertyOf message.directive:cmAttachments
                 * @description html to inject in array for the template
                 */
                var modelInput = {
                    "html": "<input type=\"file\"/>"
                };
                /**
                 * @ngdoc property
                 * @name arrayInput
                 * @propertyOf message.directive:cmAttachments
                 * @description Array to receive html
                 */
                scope.arrayInput = [];
                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmAttachments
                 * @name changeInput
                 * @description event on input change
                 * @param {Event} changeEvent event from input file on change
                 * @private
                 */
                function changeInput(changeEvent) {
                    $log.debug(changeEvent.target.files[0]);
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        $log.debug(e);

                        var id = changeEvent.target.parentNode.getAttribute("data-id");
                        /*
                         * Check if image is greater than 2mo
                         */
                        if(e.total < 2000000) {
                            scope.$apply(function () {
                                $log.debug("apply");
                                ctrl.message.attachments.push(changeEvent.target.files[0]);
                                ctrl.updateMessage();
                                scope.arrayInput = [];
                            });

                        }else {
                            cmNotify.message(gettextCatalog.getString("Your file is too large"), "error");
                        }

                    };
                    if(changeEvent.target.files.length > 0) {
                        reader.readAsDataURL(changeEvent.target.files[0]);
                    }
                }

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmAttachments
                 * @name addInput
                 * @description add new input attachment and attach changeInput event
                 */
                scope.addInput = function() {
                    scope.arrayInput.push(modelInput);
                    $timeout(function() {
                        element.find("input").unbind("change");
                        element.find("input").bind("change", changeInput);
                    });
                };

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmAttachments
                 * @name uploadAttachments
                 * @description udpate the message and reset input array
                 */
                scope.uploadAttachments = function() {
                    ctrl.updateMessage();
                    scope.arrayInput = [];
                };

                /**
                 * @ngdoc function
                 * @methodOf message.directive:cmAttachments
                 * @name removeInput
                 * @param {String} id index in the array input
                 * @description remove one input file
                 */
                scope.removeInput = function(id) {
                    scope.arrayInput.splice(id, 1);
                    if(scope.arrayInput.length === 0) {
                    }
                };
            }
        };
    };

    module.exports = directive;

}());
