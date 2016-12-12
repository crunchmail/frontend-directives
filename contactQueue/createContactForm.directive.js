(function () {
    'use strict';

    var createContactForm = function(cmNotify, globalFunction, $compile,
                                     apiContactQueue, $routeParams, gettextCatalog, _) {
        return {
            templateUrl:'views/contactQueue/createContactForm.html',
            link: function(scope, element, attrs) {
                var getUrlContactQueue;
                var form = document.createElement('form');
                form.className = "crunchForm";
                var emailField = {
                    "name":"Email",
                    "type": "Char",
                    "disabled": true
                };

                function createElementForm() {
                    //reset Form
                    form.innerHTML = "";
                    var arrForm = scope.contactqueue.contact_fields;
                    _.forOwn(arrForm, function(v, k) {
                        var formGroup = document.createElement("div");
                        formGroup.className = "crunchFormGroup";
                        //Char', 'Integer', 'Date', 'DateTime', 'Boolean', 'Float'
                        var input = document.createElement("input");
                        input.className = "crunchInput";
                        var label = document.createElement("label");
                        label.className = "crunchLabel";
                        label.textContent = arrForm[k].name;
                        label.setAttribute("for", "id_"+arrForm[k].name.toLowerCase());
                        input.id = "id_"+arrForm[k].name.toLowerCase();
                        input.name = arrForm[k].name.toLowerCase();
                        switch (arrForm[k].type) {
                            case "Char":
                                input.type = "text";
                                break;
                            case "Integer":
                                input.type = "number";
                                break;
                            case "Boolean":
                                input.type = "checkbox";
                                break;
                            case "Float":
                                input.type = "number";
                                break;
                            default:
                        }
                        if(arrForm[k].type === "Boolean") {
                            formGroup.className += " crunchFormGroupCheckBox";
                            formGroup.appendChild(input);
                            formGroup.appendChild(label);
                        }else {
                            formGroup.appendChild(label);
                            formGroup.appendChild(input);
                        }
                        form.appendChild(formGroup);
                    });
                    var submit = document.createElement("input");
                    submit.type = "submit";
                    submit.value = "Envoyer";
                    submit.className = "crunchSubmit";
                    form.appendChild(submit);

                }

                if($routeParams.hasOwnProperty('url')) {
                    getUrlContactQueue = atob($routeParams.url);
                    scope.contactqueue = {};
                    scope.contactqueue.contact_fields = [];
                    apiContactQueue.getCQ(getUrlContactQueue).then(function(result) {
                        scope.contactqueue = result.data;
                        scope.contactqueue.contact_fields.unshift(emailField);
                        var scp = scope.contactqueue.policies;
                        _.forOwn(scp, function(v, k) {
                            scope.contactqueue.policies[scp[k]] = true;
                        });
                        document.getElementById('codeToCopy').classList.remove('hidden');
                        form.action = result.data.subscription;
                        form.method = "post";
                    });
                    document.getElementById("createBtn").classList.toggle('hidden');
                    document.getElementById("updateBtn").classList.toggle('hidden');
                }else {
                    scope.contactqueue = {};
                    scope.contactqueue.contact_fields = [];
                    scope.contactqueue.contact_fields.unshift(emailField);
                }
                scope.property = {};
                scope.property.type= "Char";
                scope.checkbox = {};
                var updateProperty = document.getElementById('updateProperty');
                var styleSetForm = document.createElement('style');
                var styleForm = ".crunchForm { font-family: sans-serif; padding: 1.5em; background: #FFF; border: 1px solid #CCC; } .crunchFormGroup { margin-bottom: 1em; float: left; width: 50%; min-height: 3em; } .crunchLabel { display: block; color: #444; } .crunchInput { padding: 0.5em 1em; border: 1px solid #DDD; } .crunchSubmit { background: #2980b9; border: 0; color: #FFF; padding: 0.8em 1.5em; text-transform: uppercase; font-size: 0.8em; cursor: pointer; display: block; clear: both; } .crunchSubmit:hover { background: #409ad5; } .crunchFormGroupCheckBox .crunchLabel { display: inline-block; }";
                styleSetForm.textContent = styleForm;

                scope.showForm = function(item, index) {
                    if(item.hasOwnProperty("edition") && item.edition === true ) {
                        item.edition = false;
                    }else {
                        item.edition = true;
                    }
                    document.getElementById('formProperty_'+index).classList.toggle('hidden');
                };

                scope.removeProperty = function(idx) {
                    if(confirm('Êtes-vous sûr de vouloir supprimer cette propriété?')) {
                        scope.contactqueue.contact_fields.splice(idx, 1);
                    }
                };

                scope.createForm = function() {
                    var cloneContactQueue = JSON.parse(JSON.stringify(scope.contactqueue));
                    /*
                     * Remove Email, already added by API
                     */
                    cloneContactQueue.contact_fields.splice(0, 1);
                    var sccf = cloneContactQueue.contact_fields;
                    var scp = cloneContactQueue.policies;
                    var policiesValid = [];
                    for (var p in scp) {
                        if(scp[p]) {
                            policiesValid.push(p);
                        }
                    }
                    cloneContactQueue.policies = policiesValid;
                    _.forOwn(sccf, function(v, k) {
                        delete sccf[k].$$hashKey;
                    });
                    apiContactQueue.createContactQueue(cloneContactQueue).then(function(result) {
                        cmNotify.message(gettextCatalog.getString("Your form has been created"), "success");
                        console.log(result.data);
                        var form2 = form.cloneNode(true);
                        form2.method = "post";
                        form2.action = result.data.subscription;
                        var format = globalFunction.format(form2, 0);
                        scope.codeToCopy = styleSetForm.outerHTML + '\n' +  format.outerHTML;
                        document.getElementById('codeToCopy').classList.remove('hidden');
                    });
                };

                scope.updateForm = function() {
                    var scp = scope.contactqueue.policies;
                    var policiesValid = [];
                    for (var p in scp) {
                        if(scp[p]) {
                            policiesValid.push(p);
                        }
                    }
                    scp = policiesValid;
                    apiContactQueue.updateContactQueue(getUrlContactQueue, scope.contactqueue);
                };

                apiContactQueue.getPolicies().then(function(result) {
                    scope.policies = result.data.results;
                });

                scope.$watch("contactqueue.contact_fields", function(newValue, oldValue) {
                    createElementForm();
                    globalFunction.insertIframe('<style>body { margin: 0; }</style>'+styleSetForm.outerHTML + form.outerHTML, '#formCreated');
                    var format = globalFunction.format(form, 0);
                    scope.codeToCopy = styleSetForm.outerHTML + '\n' +  format.outerHTML;
                }, true);

                scope.createProperty = function() {
                    scope.contactqueue.contact_fields.push(scope.property);
                    scope.property = {};
                    scope.property.type= "Char";
                };

                scope.updateProperty = function(item) {
                    console.log(item);
                    console.log('test');
                };

            }
        };
    };

    module.exports = createContactForm;

}());
