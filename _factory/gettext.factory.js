/**
 * @ngdoc service
 * @name _factory.factory:gettext
 * @description
 * A convenient shortcut to gettextCatalog.getString()
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var factory = function(gettextCatalog) {
        return function(string, context ) {
            return gettextCatalog.getString(string, context);
        };

    };

    module.exports = factory;
}());
