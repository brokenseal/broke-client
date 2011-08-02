(function(){
    var
        QuerySet
        ,engineOperations= broke.db.engines.OPERATIONS
        ,settings= broke.conf.settings
    ;

    /*************************************************************************/
    /************************** BASE QUERYSET CLASS **************************/
    /*************************************************************************/
    QuerySet= Class.create({
        __name__: "broke.db.models.QuerySet"
        ,__init__: function(kwargs){
            var
                routers= settings.DATABASE_ROUTERS
                ,routersLen= routers.length
                ,i
                ,dbForRead
                ,dbForWrite
                ,router
            ;
            
            this.model= kwargs.model;
            this.db= kwargs.db;
            this.args= {
                filter: {}
                ,exclude: {}
                ,insert: {}
                ,orderBy: {}
                ,'delete': {}
            };
            this._settings= kwargs.settings || {};
            
            builtins.extend(this.args, kwargs.args);
            
            if(this.db) {
                this.dbForRead= this.db;
                this.dbForWrite= this.db;
            } else {
                this.dbForRead= broke.db.models.getDbForReadFromModel(this.model);
                this.dbForWrite= broke.db.models.getDbForWriteFromModel(this.model);
            }
            
            this.engineForRead= builtins.getattr(settings.DATABASES[this.dbForRead].ENGINE);
            this.engineForWrite= builtins.getattr(settings.DATABASES[this.dbForWrite].ENGINE);
        }
        ,settings: function(settings){
            builtins.extend(this._settings, settings);

            return this;
        }
        ,exclude: function(args){
            this.args.exclude= args;

            return this.__class__({
                model: this.model
                ,args: this.args
                ,settings: this._settings
                ,db: this.db
            });
        }
        ,filter: function(args){
            this.args.filter= args;
            
            return this.__class__({
                model: this.model
                ,args: this.args
                ,settings: this._settings
                ,db: this.db
            });
        }
        ,create: function(args, callback){
            if(builtins.typeOf(args) == "function") {
                callback= args;
                args= undefined;
            }
            this.args.insert= args;
            
            this.engineForWrite({
                operation: engineOperations.INSERT
                ,model: this.model
                ,args: this.args
                ,settings: this._settings
            }).execute(callback);
        }
        ,getOrCreate: function(args, callback){
            try {
                return this.get(args, callback);
            } catch(e) {
                if(e.name == 'DoesNotExist') {
                    return this.create(args);
                }
                
                throw e;
            }
        }
        ,get: function(args, callback){
            var
                querySet= this
                ,getCallback= function(object){
                    if(object.length > 1) {
                        throw broke.exceptions.MultipleObjectsReturned(builtins.interpolate(gettext.gettext("get() returned few %s instances -- it returned %s! Lookup parameters were %s"), querySet.model.__name__, object.length, args));
                    }
                    if(!object.length) {
                        throw broke.exceptions.DoesNotExist(builtins.interpolate(gettext.gettext("%s matching query does not exist."), querySet.model.__name__));
                    }

                    if(callback){
                        callback(object[0]);
                    }
                }
            ;
            
            if(callback === undefined) {
                callback= args;
                args= undefined;
            }

            if(args) {
                this.filter(args).all(getCallback);
            } else {
                this.all(getCallback);
            }
        }
        ,latest: function(field, callback){
            if(callback === undefined) {
                callback= field;
                field= undefined;
            }
            field= field || settings.GET_LATEST_BY;

            return this.orderBy(field).all(callback)[0];
        }
        ,orderBy: function(fields){
            if(builtins.typeOf(fields) == "string") {
                fields= [ fields ];
            }
            this.args.orderBy= fields;
            
            return this.__class__({
                model: this.model
                ,args: this.args
                ,settings: this._settings
                ,db: this.db
            });
        }
        ,all: function(settings, callback){
            if(callback === undefined) {
                callback= settings;
                settings= undefined;
            }
            
            this.engineForRead({
                operation: engineOperations.SELECT
                ,model: this.model
                ,args: this.args
                ,settings: this._settings
            }).execute(callback);
        }
        ,'delete': function(callback){
            this.engineForWrite({
                operation: engineOperations.DELETE
                ,model: this.model
                ,args: this.args
                ,settings: this._settings
            }).execute(callback);
        }
    });
})();
