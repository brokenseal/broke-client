(function(){
    var
        Model= broke.db.models.Model
        ,Manager= broke.db.models.Manager
        ,ContentType
        ,ContentTypeManager
    ;
    
    broke.contrib.contenttypes= {
        models: {}
    };
    
    ContentType= Model.create({
        __name__: "broke.contrib.contenttypes.models.ContentType"
        ,fields: {
            app_label: null
            ,model: null
        }
    });
})();