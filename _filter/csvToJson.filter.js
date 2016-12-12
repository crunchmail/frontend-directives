/**
 * @ngdoc filter
 * @name _filter.filter:csvToJson
 * @description
 * Convert a csv file to json
 */
(function () {
    'use strict';

    var filter = function() {
        return function (content) {

            var separator = ',';
            var header = true;

            var lines=content.split('\n');
            var result = [];
            var start = 0;
            var columnCount = lines[0].split(separator).length;

            var headers = [];
            if (header) {
                headers=lines[0].split(separator);
                start = 1;
            }

            for (var i=start; i<lines.length; i++) {
                var obj = {};
                var currentline=lines[i].split(new RegExp(separator+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
                if ( currentline.length === columnCount ) {
                    if (header) {
                        for (var j=0; j<headers.length; j++) {
                            obj[headers[j]] = currentline[j];
                        }
                    } else {
                        for (var k=0; k<currentline.length; k++) {
                            obj[k] = currentline[k];
                        }
                    }
                    result.push(obj);
                }
            }
            return result;
        };
    };

    module.exports = filter;

}());
