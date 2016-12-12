/**
 * @ngdoc directive
 * @name menu.directive:cmMenu
 * @description
 * List a domain
 * @requires https://docs.angularjs.org/api/ng/service/$location
 * @requires https://docs.angularjs.org/api/ng/service/$compile
 * @requires https://docs.angularjs.org/api/ng/service/$templateRequest
 * @requires https://docs.angularjs.org/api/ng/service/$route
 * @requires appSettings
 */
(function () {
    'use strict';

    var directive = function(appSettings, $location, $compile, $templateRequest, $route) {
        return {
            link: function(scope, element, attrs) {
                var pathTpl = null;

                if(appSettings.source === "Zimlet") {
                    scope.haveSidebar = "sidebar-menu";
                    pathTpl = 'views/menu/zimlet-menu.html';
                }else if(appSettings.source === "Jaw") {
                    pathTpl = 'views/menu/jaw-menu.html';
                }

                if(pathTpl !== null) {
                    /*
                    * Load template menu
                    */
                    $templateRequest(pathTpl).then(function(html){
                        var template = angular.element(html);
                        element.append(template);
                        $compile(template)(scope);
                    });
                }else {
                    $log.warn("Template is undefined");
                }

                /**
                 * @ngdoc function
                 * @name refresh
                 * @methodOf menu.directive:cmMenu
                 * @description
                 * Reload the current page
                 */
                scope.refresh = function(e, path) {
                    if($location.$$path !== '/create-message') {
                        if('#' + $location.$$path === path) {
                            $route.reload();
                        }
                    }
                };

            }
        };
    };

    module.exports = directive;

}());
