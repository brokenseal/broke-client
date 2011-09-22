(function(){
    var
        Field
        ,ForeignKey
        ,CharField
        ,TextField
        ,getter= function(){}
        ,setter= function(){}
    ;
    
    Field= Class.create({
        __name__: "broke.db.fields.Field"
        ,attachCurrentModelInstance: true
        ,contributeToClass: function(cls, fieldName){
            //this.setAttributesFromName(fieldName);
            this.model= cls;
            this.fieldName= fieldName;
        }
    });
    
    ForeignKey= Field.create({
        __name__: "broke.db.fields.ForeignKey"
        ,__init__: function(kwargs){
            this.relatedModel= kwargs.model;
            if(kwargs.relatedName) {
                this.relatedName= kwargs.relatedName;
            }
        }
        ,contributeToClass: function(cls, fieldName){
            this._super(cls, fieldName);
            this.contributeToRelatedClass(cls, fieldName);
        }
        ,contributeToRelatedClass: function(cls, fieldName){
            var
                fieldInstance= this
                ,getRelatedModels= function(){
                    return cls.objects.filter({
                        pk: this.fields[fieldName]
                    });
                }
            ;
            
            if(!this.relatedName) {
                this.relatedName= cls.__name__.toLowerCase() + '_set';
            }
            
            this.relatedModel.prototype[this.relatedName]= getRelatedModels;
            
            // is it the best way to handle this? not sure...
            getRelatedModels.model= cls;
        }
        ,__call__: function(instance, callableObject, callback){
            var
                pk= instance.fields[callableObject.fieldName] || instance.fields[callableObject.fieldName + '_id']
            ;
            
            this.relatedModel.objects.get({
                pk: pk
            }, callback);
        }
    });
    
    PositiveIntegerField= Field.create({
        __name__: "broke.db.fields.PositiveIntegerField"
        ,__call__: function(instance, callableObject, value){
            if(value !== undefined) {
                if(value < 0 || parseInt(value) === NaN) {
                    throw new Error("A PositiveIntegerField only accepts a positive integer field.");
                }
                
                instance.fields[callableObject.fieldName]= value;
            } else {
                value= instance.fields[callableObject.fieldName];
            }
            
            return value;
        }
    });
    
    TextField= Field.create({
        __name__: "broke.db.fields.TextField"
        ,__call__: function(instance, callableObject, value){
            if(value !== undefined) {
                instance.fields[callableObject.fieldName]= value;
            } else {
                value= instance.fields[callableObject.fieldName];
            }
            
            return value;
        }
    });
    
    CharField= TextField.create({
        __name__: "broke.db.fields.CharField"
        ,__init__: function(kwargs){
            this.max_length= kwargs.max_length;
        }
        ,__call__: function(instance, callableObject, value){
            if(value !== undefined) {
                if(value.length > this.max_length) {
                    throw new Error("Value exceeds set max length");
                }
                instance.fields[callableObject.fieldName]= value;
            } else {
                value= instance.fields[callableObject.fieldName];
            }
            
            return value;
        }
    });

    // TODO: DateField

    // make all the fields available as broke.db.models attributes
    broke.extend(broke.db.models, broke.db.fields);
})();