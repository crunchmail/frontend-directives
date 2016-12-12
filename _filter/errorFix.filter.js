/**
 * @ngdoc filter
 * @name _filter.filter:errorFix
 * @description
 * Convert a csv file to json
 * @requires Lodash
 * @requires gettextCatalog
 */
(function () {
    'use strict';

    var filter = function(_, gettextCatalog) {

        var errorMsg = gettextCatalog.getString('This name is already taken');

        return function (list) {

            var translateErrors = function(str)
            {
                if (str.match(/.*un ensemble unique\.$/))
                {
                    str = gettextCatalog.getString(errorMsg);
                }
                return str;
            };

            return _.forEach(list, function(errors, key) {

                _.forEach(errors, function(str, strKey) {

                    if (_.isArray(str))
                    {
                        list[key][strKey] = _.map(str, translateErrors);
                        return;
                    }

                    list[key][strKey] = translateErrors(str);
                });

            });

        };
    };

    module.exports = filter;

}());
