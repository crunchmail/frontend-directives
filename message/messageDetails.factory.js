(function () {
    'use strict';

    var factory = function(_, $log){
        return {
            getSourceType: function(arr) {
                var arrSourceRef = [];
                _.forOwn(arr, function(v, k) {
                    _.forOwn(v, function(value, key) {
                        var ref = {
                            "ref": value.source_ref
                        };
                        arrSourceRef.push(ref);
                    });
                });
                return arrSourceRef;
            }
        };
    };

    module.exports = factory;
}());
