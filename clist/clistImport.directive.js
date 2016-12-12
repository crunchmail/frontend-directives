
(function () {
    'use strict';

    var directive = function(apiClist, appSettings, $routeParams, $filter,
            $location, _, cmNotify, gettextCatalog, $log) {

        return {
            templateUrl:'views/clist/clistImport.html',
            restrict: 'A',
            require: 'cmClist',
            controller: function($scope) {

                $scope.url = atob($routeParams.url);
                $scope.exampleLimit = 3;
                $scope.tabsMenu = {
                    "active": 0
                };

                $scope.csv = {
                    content: '',
                    header: [],
                    separator: ',',
                };

                $scope.form = {
                    content: ""
                };

                $scope.fields = {
                    address: '',
                    custom: [],
                    sample: [],
                    matching: []
                };

                $scope.types = apiClist.types;
                $scope.clist = {};

                $scope.errors = null;

                // loading contact list data to the model
                apiClist.getOne($scope.url).then(function(result) {
                    $scope.clist = result;
                });

                // csv can be uploaded or manually import in textarea
                // TODO: find a way to use ng-change to avoid watcher
                $scope.$watch('csv.content', function(content, old) {
                    if (content === old)
                    {
                        return;
                    }
                    $scope.handleCSV();
                });

                $scope.onImportClist = function()
                {
                    $scope.errors = null;
                    cmNotify.message(gettextCatalog.getString("Your contact were imported with success."), "success");
                    $location.url('/contactlists');
                };

                // print import errors
                $scope.onImportFail = function(errors)
                {
                    // import failed
                    var no_address = errors.no_address;
                    var detail     = errors.validation_errors;

                    // format error for CSV export
                    errors.duplicates = _.map(errors.duplicates, function(v) {
                        return {
                            address: v
                        };
                    });

                    // we need to know all keys with errors first to generate
                    // the objects for CSV export
                    var allKeys = [];

                    _.forEach(errors.validation_errors,
                        function(data, key) {
                            if (undefined === data.properties)
                            {
                                return;
                            }
                            _.forEach(data.properties, function(pData, pKey) {
                                allKeys.push(pKey);
                            });
                        }
                    );

                    errors.validation_errors = _.map(errors.validation_errors,
                        function(data, key) {

                            var out = {
                                address: key
                            };

                            if (data.properties === undefined)
                            {
                                data.properties = {};
                            }

                            // flatten the errors for CSV printing
                            var importError = function(out, data, field) {

                                if (undefined === data[field])
                                {
                                    out['error.' + field] = '';
                                    return;
                                }

                                out['error.' + field] = data[field].join('\n');
                            };

                            // import errors in key address and key properties
                            importError(out, data, 'address');

                            for (var k=0;k < allKeys.length;k++)
                            {
                                importError(out, data.properties, allKeys[k]);
                            }

                            return out;
                        }
                    );

                    // save errors, for CSV generation
                    $scope.errors = errors;

                    // clear preview
                    $scope.csv.result = null;
                };

                /**
                 * Import csv formatted string as contacts
                 */
                $scope.previewImportClist = function()
                {
                    $scope.csv.header = [];
                    $log.debug("preview");
                    // we use the same as ng-csv-import
                    $scope.csv.result = $filter('csvToJson')($scope.form.content);
                    _.forOwn($scope.csv.result[0], function(v, k) {
                        $scope.csv.header.push(k);
                    });
                    $scope.handleCSV();
                };

                $scope.buildSample = function(values, key)
                {
                    var sample = angular.copy(values);

                    // only keep rows with a value for the key "key"
                    _.remove(sample, function(o) {
                        return (_.isEmpty(o[key]));
                    });

                    // and only keep 5 first values
                    sample = _.slice(sample, 0, 5);

                    // transform sample into a simple flat array
                    sample = _.map(sample, function(o) {
                        return o[key];
                    });

                    $log.debug("sample");
                    $log.debug(sample);

                    return sample;
                };

                /*
                 * Fix bug ng-model not updated
                 */
                var saveLastHandle = [];
                var countHandleCall = 0;

                $scope.handleCSV = function()
                {
                    $log.debug("handleCSV");
                    var e, found, name, m, sample, shortname;

                    $log.debug($scope.csv.header);
                    $log.debug($scope.csv.result);

                    // full header, with email address
                    $scope.fields.all     = $scope.csv.header;

                    // get the name of address field (first field)
                    $scope.fields.address = $scope.fields.all[0];

                    // remove address field and store in "custom"
                    $scope.fields.custom  = _.drop($scope.fields.all);

                    // create a sample of values
                    $scope.fields.samples = {};

                    $log.debug("$scope.fields.address");
                    $log.debug($scope.fields.address);
                    $log.debug("$scope.fields.all");
                    $log.debug($scope.fields.all);

                    // get samples for address field
                    sample = $scope.buildSample($scope.csv.result,
                            $scope.fields.address);
                    $scope.fields.samples[$scope.fields.address] = sample;

                    var shortnameArr = [];

                    // for each header of the CSV
                    for (var i = 0 ; i < $scope.fields.custom.length ; i++)
                    {
                        // name of the field, without prefix
                        name      = $scope.fields.custom[i];
                        shortname = name.replace(/^properties\./,'');
                        shortnameArr.push(shortname);

                        // shortcut to current matching
                        m = $scope.fields.matching[i] = {};

                        // look for that name in contact_fields
                        found = _.findIndex($scope.clist.contact_fields,
                                { name: shortname });

                        // generate samples for current field
                        sample = $scope.buildSample($scope.csv.result, name);
                        $scope.fields.samples[name] = sample;

                        if (sample.length === 0)
                        {
                            $log.debug("-1");
                            // no sample, we remove the field
                            m.create = '-1';
                        }
                        else if (found !== -1)
                        {
                            // auto select field if already exists
                            // auto check "existing field"
                            $log.debug("0");
                            m.create = '0';
                            // add _ to force ng-model
                            if(!_.isUndefined(saveLastHandle[saveLastHandle.length - 1]) && saveLastHandle[saveLastHandle.length - 1][i] === shortname) {
                                m.name = shortname + "_";
                            }else {
                                m.name = shortname;
                            }
                        }
                        // auto fill if doesn't exists (new property)
                        else
                        {
                            // auto check "create new" if not found
                            $log.debug("1");
                            m.create = '1';
                            // add _ to force ng-model
                            if(!_.isUndefined(saveLastHandle[saveLastHandle.length - 1]) && saveLastHandle[saveLastHandle.length - 1][i] === shortname) {
                                m.new = shortname + "_";
                            }else {
                                m.new = shortname;
                            }
                        }

                        // TODO: guess type
                        m.type = apiClist.defaultType;
                    }
                    saveLastHandle.push(shortnameArr);

                    // Reset saveLastHandle to update model if same value
                    if(countHandleCall >= 1) {
                        saveLastHandle = [];
                        countHandleCall = 0;
                    }else {
                        countHandleCall++;
                    }


                };

                /**
                 * Create new contact fields, before importing CSV
                 *
                 * @param object clist
                 * @param object matching
                 * @return promise
                 */
                $scope.createNewFields = function(clist, matching)
                {
                    // get the contact fields to create
                    var create = _.filter(matching, { create: '1' });

                    // create an object respecting API format
                    create = _.map(create, function(e) {
                        return {
                            name: e.new,
                            required: e.required ? true : false,
                            type: e.type
                        };
                    });
                    // concat with exiting fields
                    clist.contact_fields = clist.contact_fields.concat(create);

                    $log.debug(clist);

                    // import contact_fields
                    return apiClist.edit(clist);
                };

                /**
                 * Import csv formatted string as contacts
                 *
                 * @param object list contact list where to import
                 * @param string str CSV string to import
                 * @return promise
                 */
                $scope.importClist = function()
                {
                    var matching = $scope.fields.matching,
                    str      = $scope.csv.result ? $scope.csv.result :
                        $scope.form.content;

                    // build the new header (matching[n].name/new)
                    matching = _.mapValues(matching, function(e) {
                        if (e.create === '1')
                        {
                            e.name = e.new;
                        }
                        else if (e.create === '-1')
                        {
                            e.name = 'ignored';
                        }
                        return e;
                    });

                    str = window.Papa.unparse(str);

                    // build the new header
                    var trim   = _.mapValues(matching, function(v) {

                        v.name = v.name.trim().replace(/^properties\./, '');

                        // to avoid conflict with address field
                        v.name = 'properties.' + v.name;

                        return v;
                    });
                    var header = _.pluck(matching, 'name').join(',');

                    // replace the header, with address first
                    str = str.replace(/[^\n]*\n/, 'address,' + header + "\n");

                    // remove the ignored fields
                    var keep = _.pluck(_.reject(matching, { create: "-1" }), 'name');

                    // import contact_fields
                    return $scope.createNewFields($scope.clist, matching)
                        .then(function(data) {
                            // then import contacts
                            return apiClist.import($scope.clist, str, keep);
                        }).then(function(data) {
                            $scope.onImportClist();
                        }, function(result) {

                            $scope.onImportFail(result.data);

                        });
                };
            }
        };
    };

    module.exports = directive;

}());
