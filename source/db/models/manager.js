(function(){
    var
        LocalQuerySet= broke.db.models.LocalQuerySet
        RemoteQuerySet= broke.db.models.RemoteQuerySet
        ,QUERY_TYPE= broke.conf.settings.QUERY_TYPE
    ;

    /*************************************************************************/
    /****************************** MANAGER **********************************/
    /*************************************************************************/
    Class.create({
        __parent__: window
        ,__name__: "broke.db.models.Manager"
        ,__init__: function(model){
            this.model= model;
        }
        ,all: function(callback){
            return this.getQuerySet().all(callback);
        }
        ,create: function(args, callback){
            return this.getQuerySet().create(args, callback);
        }
        ,exclude: function(args){
            return this.getQuerySet().exclude(args);
        }
        ,filter: function(args){
            return this.getQuerySet().filter(args);
        }
        ,get: function(args, callback){
            return this.getQuerySet().get(args, callback);
        }
        ,getOrCreate: function(args, callback){
            return this.getQuerySet().getOrCreate(args, callback);
        }
        ,getQuerySet: function(){
            return new broke.db.models.QuerySet({ model: this.model, db: this.db });
        }
        ,settings: function(settings){
            return this.getQuerySet().settings(settings);
        }
        ,latest: function(args, callback){
            return this.getQuerySet().latest(args, callback);
        }
        ,using: function(db){
            this.db= db;
            return this;
        }
    });
})();
