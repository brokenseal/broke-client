;(function(undefined){
    var
        JSONSchemaStorage= {} // the actual JSON used to store data
        ,JSONSchemaModelStorageMapping= {}
        ,cleanData= function(kwargs, model){
            var
                result= kwargs
                ,defaultPistonAttributeFieldsHolder
            ;

            if(model) {
                defaultPistonAttributeFieldsHolder= model.__name__.toLowerCase() + '_ptr';
            }

            if(defaultPistonAttributeFieldsHolder && kwargs[defaultPistonAttributeFieldsHolder]) {
                // support for default django piston json emitter
                result= {
                    pk: kwargs[defaultPistonAttributeFieldsHolder].pk
                    ,fields: kwargs[defaultPistonAttributeFieldsHolder]
                };

            } else if(!kwargs.fields) {
                // support for generic json emitter (???)

                result= {
                    pk: kwargs.pk
                    ,fields: kwargs
                };

            }

            return result;
        }
    ;

    broke.storages= {
        // TODO: change this with IndexedDb if available (?)
        JSONSchema: {
            index: {}
            ,position: {}
            ,autoPk: 0
            ,initTableForModel: function(model, objects){
                var
                    tableName= model.getTableName()
                ;

                if(JSONSchemaStorage[tableName] === undefined) {
                    JSONSchemaStorage[tableName]= objects || [];
                }

                // init pk index for this table
                broke.storages.JSONSchema.index[tableName]= {};
                
                JSONSchemaModelStorageMapping[tableName]= model;

                return JSONSchemaStorage[tableName];
            }
            ,getTable: function(tableName){
                return JSONSchemaStorage[tableName];
            }
            ,get: function(pk, tableName){
                // TODO: improve
                broke.storages.JSONSchema.index[tableName]= broke.storages.JSONSchema.index[tableName] || {};
                
                return broke.storages.JSONSchema.index[tableName][pk];
            }
            ,set: function(tableName, kwargs) {
                var
                    dbTable= JSONSchemaStorage[tableName]
                    ,i= dbTable.length
                    ,obj= this.get(kwargs.pk, tableName)
                    ,model= JSONSchemaModelStorageMapping[tableName]
                    ,position
                ;

                kwargs= cleanData(kwargs, model);

                if(!kwargs.pk) {
                    kwargs.pk= null;
                    broke.log("Objects must have a primary key!");
                }

                if(kwargs.pk == 'auto') {
                    kwargs.pk= 'new_' + broke.storages.JSONSchema.autoPk;
                    broke.storages.JSONSchema.autoPk+= 1;
                }
                
                if(obj) {
                    position= broke.storages.JSONSchema.position[kwargs.pk];
                    dbTable[position]= kwargs;
                    obj= kwargs;
                } else {
                    kwargs._meta= {
                        model: model
                    };

                    broke.storages.JSONSchema.index[tableName][kwargs.pk]= kwargs;
                    position= dbTable.push(kwargs);
                    broke.storages.JSONSchema.position[kwargs.pk]= position-1;
                }

                return kwargs;
            }
            ,'delete': function(tableName, pk){
                var
                    dbTable= JSONSchemaStorage[tableName]
                    ,position= broke.storages.JSONSchema.position[pk]
                ;

                builtins.remove(dbTable, position);
            }
        }
        ,localStorage: (function(){
            // mime or reference HTML 5's Local Storage
            var
                localStorageSetObject= function(key, value) {
                    this.setItem(key, JSON.stringify(value));
                }
                ,localStorageGetObject= function(key) {
                    return JSON.parse(this.getItem(key));
                }
                ,storage= {}
            ;
            
            if('localStorage' in window) {
                broke.extend(Storage.prototype, {
                    set: localStorageSetObject
                    ,get: localStorageGetObject
                });

                return localStorage;
            }

            return {
                key: function(key){
                    throw {
                        name: "NotImplementedError",
                        description: "Sorry, this version of localStorage is a fake and does not support key() method."
                    };
                }
                ,setItem: function(key, value){
                    storage[key]= value;
                    return this;
                }
                ,getItem: function(key){
                    return storage[key];
                }
                ,removeItem: function(key){
                    delete storage[key];
                    return this;
                }
                ,get: localStorageGetObject
                ,set: localStorageSetObject
                ,clear: function(){
                    storage= {};
                    return this;
                }
            };
        })()
    };
})();