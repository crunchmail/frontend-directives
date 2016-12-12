/**
* Contact list model (api calls)
*
* TODO: ng-notify, move and change system
* TODO: automatic CRUD system
*/
(function () {
'use strict';

var apiClist = function($http, $q, moment, _, gettextCatalog, $rootScope){

    return {
        urlTpl:"",
        // contact fields types
        types: {
          "Char":       gettextCatalog.getString("Char"),
          "Integer":    gettextCatalog.getString("Integer"),
          "Date":       gettextCatalog.getString("Date"),
          "DateTime":   gettextCatalog.getString("Date and time"),
          "Boolean":    gettextCatalog.getString("Boolean"),
          "Float":      gettextCatalog.getString("Float")
        },
        defaultType: 'Char',
        /**
         * Convert contact fields to proper javascript type (for angular)
         */
        convertTypes: function(clist, contact)
        {
            var type,
                name,
                value,
                fields = clist.contact_fields;

            if (_.isEmpty(contact))
            {
                return contact;
            }

            for (var i=0 ; i < fields.length ; i++)
            {
                type  = fields[i].type;
                name  = fields[i].name;
                value = contact.properties[name];

                if (value === undefined)
                {
                    continue;
                }

                switch (type)
                {
                    case 'Integer':
                        contact.properties[name] = parseInt(value);
                        break;

                    case 'Date':
                        contact.properties[name] = moment(value).toDate();
                        break;

                    case 'DateTime':
                        contact.properties[name] = moment(value).toDate();
                        break;

                    case 'Float':
                        contact.properties[name] = parseFloat(value);
                        break;
                }

            }

            return contact;
        },
        getAll: function(config) {
            return $http.get($rootScope.contactList, config).then(function(result) {
                return result.data;
            });
        },
        getOne: function(url, config) {
            return $http.get(url, config).then(function(result) {
                return result.data;
            });
        },
        add: function(data, config) {

            if (undefined === data.contact_fields)
            {
                data.contact_fields = [];
            }

            if (undefined === data.properties)
            {
                data.properties = {};
            }

            return $http.post($rootScope.contactList, data, config).then(function(result) {
                return result.data;
            });
        },
        // TODO: replace by simple API call when this will be deprecated by
        // API updates
        clone: function(list, name, config) {
            // create the copy, without url
            // and with proper list url
            var obj = angular.copy(list);
            obj.name = name;
            delete obj.url;

            var that = this;
            var newlist;

            // we add the new clist
            return this.add(obj).then(function(data) {

                newlist = data;
                // we get the list on contacts of the original
                return that.getOne(list._links.contacts.href, config);

            }).then(function(data) {

                // list of contacts
                var contacts   = data.results;

                for (var i = 0 ; i < contacts.length ; i++)
                {
                    contacts[i].contact_list = newlist.url;
                }
                newlist.contacts_count = contacts.length;

                // we add the contacts to the new list
                return that.addContact(contacts);
            }).then(function(data) {
                return newlist;
            });

        },
        merge: function(name, clistList, config) {

            var that = this;
            var lists = angular.copy(clistList);

            // we get the first list object, because we need the merge link
            return that.getOne(lists[0].url, config).then(function(data) {
                lists.shift();
                return $http.post(data._links.merge.href, _.map(lists, 'url'));
            }).then(function(result) {
                // edit name
                result.data.name = name;
                return that.edit(result.data);
            });
        },
        edit: function(data, config) {
            return $http.put(data.url, data, config).then(function(result) {
                return result.data;
            });
        },
        deleteProperty: function(list, prop, config) {

            var copy = angular.copy(list);
            // remove from list
            copy.contact_fields.splice(copy.contact_fields.indexOf(prop), 1);

            return this.edit(copy, config);
        },
        addContact: function(data, config) {
            return this.addOrEditContact(null, data, config);
        },
        editContact: function(url, data, config) {
            return this.addOrEditContact(url, data, config);
        },
        addOrEditContact: function(url, data, config) {

            var promise;

            // clean data that are empty
            data.properties = _.omit(data.properties, _.isNull);
            data.properties = _.mapValues(data.properties, function(v) {
                if (_.isBoolean(v))
                {
                    return v ? '1' : '0';
                }
                if (_.isDate(v))
                {
                    return moment(v).format('YYYY-MM-DD');
                }
                return v;
            });

            if (!url)
            {
                return $http.post($rootScope.contacts, data, config)
                    .then(function(result) {
                        return result.data;
                    });
            }
            return $http.put(url, data, config)
                .then(function(result) {
                    return result.data;
                });
        },
        /**
         * Add contact, bulk mode, without typing
         */
        addContactBulk: function(data, config) {

            return $http.post($rootScope.contacts, data, config)
                .then(function(result) {
                    return result.data;
            });
        },
        copyContact: function(contact, listUrl, config) {
            // create the copy, without url
            // and with proper list url
            var obj = angular.copy(contact);
            obj.contact_list = listUrl;
            delete obj.url;

            return this.addOrEditContact(null, obj, config);
        },
        delete: function(url, config) {

            // TODO: migrate to future api bulk delete by removing
            // the following code:
            if (_.isArray(url))
            {
                return this.deleteBulk(url, config);
            }

            return $http.delete(url, config);
        },
        // TODO: remove when this will be deprecated by API updates
        deleteBulk: function(lists, config) {

            var defer = $q.defer();
            var promises = [];

            for (var i = 0; i < lists.length ; i++)
            {
                promises.push(this.delete(lists[i].url, config));
            }

            return $q.all(promises).then(function(all) {
                defer.resolve();
            });

            //return defer;
        },
        // TODO: use config?
        export: function(list) {
            // GET with different content-type
            return $http({
                method: 'GET',
                url: list._links.contacts.href,
                headers: { 'Accept': 'text/csv; charset=utf-8' }
            }).then(function(result) {
                return result.data;
            });
        },
        // TODO: handle partial error (20x)
        import: function(list, str, keep) {

            // fields have to be added to the url so that
            // we can ignore unwanted ones
            var qsa;
            if (keep)
            {
                qsa= '?fields=[' + keep.join(',') + ']';
            }

            // POST with different content-type
            return $http({
                method: 'POST',
                url: list._links.contacts.href + '?' + qsa,
                headers: { 'Content-Type': 'text/csv; charset=utf-8' },
                data: str
            }).then(function(result) {
                return result.data;
            });
        },
        // TODO: bulk
        deleteContact: function(url, config) {
            // TODO: migrate to future api bulk delete by removing
            // the following code:
            if (_.isArray(url))
            {
                return this.deleteContactBulk(url, config);
            }
            return $http.delete(url, config);
        },
        // TODO: remove when this will be deprecated by API updates
        deleteContactBulk: function(contacts, config) {

            var defer = $q.defer();
            var promises = [];

            for (var i = 0; i < contacts.length ; i++)
            {
                promises.push(this.deleteContact(contacts[i].url, config));
            }

            return $q.all(promises).then(function(all) {
                defer.resolve();
            });
        }
    };
};

module.exports = apiClist;
}());
