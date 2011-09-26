(function(context, undefined){
    var
        Field
        ,ForeignKey
        ,CharField
        ,TextField
        ,BooleanField
        ,PositiveIntegerField
        ,getter= function(){}
        ,setter= function(){}
    ;
    
    Field= Class.create({
        __name__: "broke.db.fields.Field"
        ,__init__: function(kwargs){
            this['default']= kwargs['default'];
        }
        ,get: function(instance){
            return instance.fields[this.fieldName] || this['default'];
        }
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
            this._super(kwargs);
            
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
                        pk: this.instance.fields[fieldName]
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
        ,get: function(instance, callback){
            var
                pk= instance.fields[this.fieldName] || instance.fields[this.fieldName + '_id']
            ;
            
            this.relatedModel.objects.get({
                pk: pk
            }, callback);
        }
    });
    
    PositiveIntegerField= Field.create({
        __name__: "broke.db.fields.PositiveIntegerField"
        ,set: function(instance, value){
            if(value < 0 || parseInt(value) === NaN) {
                throw new Error("A PositiveIntegerField only accepts a positive integer field.");
            }

            instance.fields[this.fieldName]= value;
            
            return value;
        }
    });

    BooleanField= Field.create({
        __name__: "broke.db.fields.BooleanField"
        ,set: function(instance, value){
            if(builtins.typeOf(value) != "boolean") {
                throw new Error("A BooleanField only accepts a boolean values.");
            }
            
            instance.fields[this.fieldName]= value;

            return value;
        }
    });

    TextField= Field.create({
        __name__: "broke.db.fields.TextField"
        ,set: function(instance, value){
            instance.fields[this.fieldName]= value;
            
            return value;
        }
    });
    
    CharField= TextField.create({
        __name__: "broke.db.fields.CharField"
        ,__init__: function(kwargs){
            this._super(kwargs);
            
            this.max_length= kwargs.max_length;
        }
        ,set: function(instance, value){
            if(value.length > this.max_length) {
                throw new Error("Value exceeds set max length");
            }
            instance.fields[this.fieldName]= value;
            
            return value;
        }
    });

    // TODO: DateField

    // make all the fields available as broke.db.models attributes
    broke.extend(broke.db.models, broke.db.fields);
})(this);