/**
 * @ngdoc directive
 * @name _directives.directive:placeholder
 * @description
 * Auto-translation of placeholders. See : {@link https://angular-gettext.rocketeer.be/dev-guide/custom-annotations/}
 * @restrict A
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var directive = function(gettextCatalog){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                var setTranslation = function(){
                    var translatedPlaceholder = gettextCatalog.getString(attrs.placeholder);
                    element.attr('placeholder', translatedPlaceholder);
                };

                scope.$on('gettextLanguageChanged', setTranslation);
                setTranslation();
            }
        };
    };

    module.exports = directive;

}());
