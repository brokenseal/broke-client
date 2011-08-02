(function(){
    var
        GenericForeignKey
        ,contenttypes= broke.contrib.contenttypes
        ,ContentType= contenttypes.models.ContentType
        ,Field= broke.db.fields.Field
        ,getModel= broke.db.models.getModel
    ;
    
    GenericForeignKey= Field.create({
        __name__: "broke.contrib.contenttypes.generic.GenericForeignKey"
        ,__init__: function(kwargs){
            kwargs= kwargs || {};
            this.ct_field= kwargs.ct_field || 'content_type';
            this.fk_field= kwargs.fk_field || 'object_id';
        }
        ,__call__: function(instance, callableObject, callback){
            var
                genericFkField= this
            ;
            
            ContentType.objects.get({
                pk: instance.fields[genericFkField.ct_field]
            }, function(contentType){
                var
                    model= getModel(contentType.fields.app_label, contentType.fields.model)
                ;
                
                // TODO: fix that with a better solution
                //model.objects.get({ pk: instance.fields[genericFkField.fk_field] }, function(object){
                model.objects.filter({ pk: instance.fields[genericFkField.fk_field] }).all(function(object){
                    if(callback) {
                        object= object[0];
                        callback(object);
                    }
                });
            });
        }
    });
})();