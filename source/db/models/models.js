;(function(undefined){
    var
        Model
        ,models= broke.db.models
        ,Manager= models.Manager
        ,elementsCache= {}
        ,contentTypeCache= {}
    ;
    
    builtins.extend(broke.db.models, {
        addContentType: function(appLabel, modelName, model){
            if(contentTypeCache[appLabel] === undefined) {
                contentTypeCache[appLabel]= {};
            }
            
            contentTypeCache[appLabel][modelName]= model;
        }
        ,getDbFromModel: function(operation, model){
            var
                routers= broke.conf.settings.DATABASE_ROUTERS
                ,routersLen= routers.length
                ,db
            ;   
            
            // retrieve db for read
            for(i= 0; i< routersLen; i++) {
                router= builtins.getattr(routers[i])();
                db= router[operation](model);
                
                if(db) {
                    return db;
                }
            }
            
            return 'default';
        }
        ,getDbForReadFromModel: function(model){
            return broke.db.models.getDbFromModel('dbForRead', model);
        }
        ,getDbForWriteFromModel: function(model){
            return broke.db.models.getDbFromModel('dbForWrite', model);
        }
        ,getModel: function(appLabel, modelName){
            return contentTypeCache[appLabel][modelName];
        }
        ,compareObjects: function(firstObject, secondObject){
            if(firstObject.__class__.__fullname__ == secondObject.__class__.__fullname__ && firstObject.pk == secondObject.pk) {
                return true;
            }
            
            return false;
        }
        ,fetchDataForModel: function(model, args){
            // TODO: is this still useful? if yes, it needs refactor
            var
                settings= broke.conf.settings
                ,url= args.url || builtins.interpolate(settings.JSON_URLS.getData, {
                    appLabel: model.appLabel
                    ,model: model.className.toLowerCase()
                })
                ,filter= args.filter || {}
                ,result
                ,defaultDbEngine= builtins.getattr(settings.DATABASES['default'].ENGINE);
            ;

            $.ajax({
                async: false,
                type: "GET",
                url: url,
                data: filter,
                dataType: settings.AJAX.dataType,
                error: function(xhr, status, error){
                    result= error;
                },
                success: function(data, status){
                    defaultDbEngine.initTableForModel(model, data);
                    result= data;
                }
            });

            return result;
        }
    });
    
    /*************************************************************************/
    /******************************* MODEL ***********************************/
    /*************************************************************************/

    Class.create({
        __name__: "broke.db.models.ModelMetaClass"
        ,__init__: function(__class__){
            var
                defaultManager
            ;
            
            __class__.objects= Manager(__class__);
            __class__.appLabel= __class__.__fullname__.split('.').slice(-3, -2)[0];
            
            // init fields which contribute to the class
            builtins.forEach(__class__.prototype, function(key){
                if(this instanceof Manager && defaultManager === undefined) {
                    defaultManager= this;
                }
                
                if(this.contributeToClass) {
                    this.contributeToClass(__class__, key);
                }
            });
            
            __class__._defaultManager= defaultManager || __class__.objects;
        }
        // exceptions
        ,DoesNotExist: broke.exceptions.DoesNotExist
        ,MultipleObjectsReturned: broke.exceptions.MultipleObjectsReturned
        ,getTableName: function(){
            if(!this._tableName){
                this._tableName= [this.appLabel, this.__name__.toLowerCase()].join('_');
            }
            
            return this._tableName;
        }
        ,getObjectFromElement: function(element, callback){
            var
                model
                ,objectPk= element.attr('data-pk')
                ,appLabel= element.attr('data-app_label')
                ,model= this.__name__.toLowerCase()
            ;
            
            models.getModel(appLabel, model)._defaultManager.getOrCreate({ pk: objectPk }, callback);
        }
        ,getBaseRemoteUrl: function(){
            if(!this._remoteBaseUrl) {
                this._remoteBaseUrl= broke.conf.settings.API_BASE_URL + this.__name__.toLowerCase() + '/'
            }
            
            return this._remoteBaseUrl;
        }
    });
    
    Model= Class.create({
        __name__: "broke.db.models.Model"
        ,__metaclass__: broke.db.models.ModelMetaClass
        ,__init__: function(args, inheritedFields){
            var
                baseUrl= this.__class__.getBaseRemoteUrl()
                ,currentInstance= this
                ,tmpArgs
                ,key
            ;
            
            // TODO: add a an adapter for piston and django type of data
            if(args.fields === undefined) {
                tmpArgs= {};
                tmpArgs.fields= args;
                tmpArgs.pk= args.pk || args.id;
                args= tmpArgs;
            }
            
            // extend current object
            broke.extend(this, args || {});
            
            // init primary key
            if(this.pk) {
                this.fields.pk= this.pk;
            }
            
            // init remote urls
            this.remoteUrls= {
                get: baseUrl
                ,save: baseUrl
                ,update: baseUrl + this.pk + '/'
                ,'delete': baseUrl + this.pk + '/'
            };
        }
        ,fields: {}
        ,elements: function(kwargs){
            // element identifier : e.g. entry_21
            // TODO: change it to use content types
            var
                extraFilter
                ,context= document
                ,clearCache
                ,elements
                ,filterExpression
            ;
            
            if(kwargs) {
                extraFilter= kwargs.filter || '';
                context= kwargs.context || document;
                clearCache= kwargs.clearCache;
                filterExpression= kwargs.filterExpression || '';
            } else {
                filterExpression= '[data-pk="' + this.fields.pk + '"]'+
                    '[data-app_label="' + this.__class__.appLabel + '"]'+
                    '[data-model="' + this.__class__.__name__.toLowerCase() + '"]';
            }
            clearCache= clearCache === undefined ? false : clearCache;
            
            if(!elementsCache[filterExpression]) {
                clearCache= true;
            }
            
            if(clearCache) {
                elements= $(filterExpression, context);
                
                if(extraFilter) {
                    elements= elements.filter(extraFilter);
                }
                
                elementsCache[filterExpression]= elements;
            }
            
            return elementsCache[filterExpression];
        }
        ,getForm: function(formSetParent){
            if(!this.form) {
                this.form= broke.forms.Form({
                    instance: this
                    ,formSetParent: formSetParent
                });
            }
            
            return this.form;
        }
        ,getAbsoluteUrl: function(){
                return '';
        }
        ,getOperation: function(del){
            if(del !== undefined && this.fields.pk) {
                return 'delete';
            }
            else if(this.fields.pk) {
                return 'update';
            }
            
            return 'create';
        }
        ,processFields: function(){
            var
                data= {}
            ;
            
            builtins.forEach(this.fields, function(key){
                if(this instanceof Model) {
                    
                    data[key]= this.pk.toString();
                    
                } else if(builtins.typeOf(this) == "object" && (this.pk || this.id)) {
                    data[key]= this.pk || this.id;
                } else if(builtins.startsWith(key, '_')) {
                    // do nothing
                    
                    return;
                } else if(this !== undefined) {
                    
                    data[key]= this.toString();
                    
                }
            });

            return data;
        }
        ,update: function(fields, saveSettings, callback){
            
            builtins.extend(this.fields, fields);
            
            return this;
        }
        ,save: function(saveSettings, callback){
            // TODO: clean up this mess
            var
                object= this
                ,className= object.__class__.__name__.toLowerCase()
                ,operation
                ,serverOperation
                ,apiBaseUrl= broke.conf.settings.API_BASE_URL
                ,operationsMap= {
                    'save': 'POST'
                    ,'update': 'PUT'
                    ,'delete': 'DELETE'
                }
                ,data= {}
                ,created= true
                ,overrideLocalData
                ,using
                ,dbForWrite
                ,engineForWrite
                ,engineOperation= 'insert'
                ,engineOperationArgs= {
                    insert: {}
                    ,update: {}
                    ,'delete': {}
                }
            ;

            if(builtins.typeOf(saveSettings) == 'function') {
                callback= saveSettings;
                saveSettings= {};
            }
            
            saveSettings= saveSettings || {};
            url= saveSettings.url || apiBaseUrl + className + '/';
            overrideLocalData= saveSettings.overrideLocalData === undefined ? true : saveSettings.overrideLocalData;
            
            // using
            dbForWrite= saveSettings.using;
            
            // load defaults on save settings
            saveSettings= broke.extend(builtins.clone(broke.conf.settings.SAVE), saveSettings);
            
            operation= saveSettings.operation ? 'delete' : 'save';
            
            // trigger model pre_save event
            broke.DOM.$window.trigger('broke.' + className + '.pre_' + operation, [object]);
            
            if(operation == 'save' && object.pk) {
                serverOperation= 'update';
                engineOperation= 'update';
            } else if(operation == 'save') {
                engineOperation= 'insert';
            } else if(operation == 'delete' && !object.pk){
                // TODO
                //throw new Error("? ^^");
            } else {
                serverOperation= operation;
                engineOperation= operation;
            }
            
            if(this.pk && operation != 'save') {
                url += object.pk + '/';
            }
            
            data= this.processFields();
            engineOperationArgs[engineOperation]= data;
            
            dbForWrite= dbForWrite !== undefined ? dbForWrite : broke.db.models.getDbForWriteFromModel(this.__class__);
            engineForWrite= builtins.getattr(broke.conf.settings.DATABASES[dbForWrite].ENGINE);
            
            // mark this object as being deleted
            this.fields._deleted= true;
            
            if(saveSettings.commit) {
                return engineForWrite({
                    operation: engineOperation
                    ,model: this.__class__
                    ,object: this
                    ,args: engineOperationArgs
                    ,settings: saveSettings
                }).execute(function(data, status, xhr, error){
                    
                    broke.DOM.$window.trigger('broke.' + className + '.post_' + engineOperation, [object]);
                    
                    if(callback) {
                        callback(data);
                    }
                    
                });
            }
        }
        ,'delete': function(settings, callback){
            if(builtins.typeOf(settings) == "function") {
                callback= settings;
                settings= {};
            }
            settings= settings || {};
            
            this.fields._deleted= true;
            
            settings.operation= 'delete';
            return this.save(settings, callback);
        }
    });
})();