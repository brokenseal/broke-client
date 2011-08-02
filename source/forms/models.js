(function(){
    var
        saveAsAjaxRequest= function(data){
            var result;
            
            $.ajax({
                async: false
                ,method: 'POST'
                ,data: data
                ,success: function(status){
                    result= status;
                }
                ,error: function(status){
                    result= status;
                }
            });
            
            return result;
        }
        ,saveAsFormPost= function(data){
            var
                form= $('<form action="." method="post" style="display:none;"></form>')
                ,field= $('<textarea></textarea>')
                ,newField
            ;
            
            builtins.forEach(data, function(key){
                newField= field.clone();
                newField.attr('name', key);
                
                if(builtins.typeOf(this) == "boolean") {
                    if(this == true) {
                        newField.val('on');
                        form.append(newField);
                    }
                } else if(builtins.typeOf(this) == "array") {
                    builtins.forEach(this, function(){
                        newField= field.clone();
                        newField.val(this);
                        newField.attr('name', key);
                        
                        form.append(newField);
                    });
                } else {
                    newField.val(this);
                    form.append(newField);
                }
            });
            
            form
                .appendTo('body')
                .submit()
            ;
            
            return form;
        }
    ;
    
    Class.create({
        __name__: "broke.forms.Form"
        ,__init__: function(kwargs){
            /*
                kwargs: {
                    instance
                    formSetParent
                }
            */
            
            builtins.extend(this, kwargs);
        }
        ,save: function(settings){
            var
                useAjax= settings.useAjax || broke.conf.settings.useAjax
                ,result
                ,prefix= settings.prefix || ''
                ,form= this
                ,data= {}
            ;
            
            // putting all the data from the object into the form
            builtins.forEach(this.instance.getData(), function(key){
                data[prefix + key]= this;
            });
            
            if(this.formSetParent) {
                // if this form is part of a formset, it won't post itself to the server
                // but rather return itself to the formset parent's save method
                return data;
                
            } else if(useAjax) {
                
                result= saveAsAjaxRequest(data);
                
            } else {
                
                result= saveAsFormPost(data);
                
            }
            
            return result;
        }
    });
    
    Class.create({
        __name__: "broke.forms.FormSet"
        ,__init__: function(kwargs){
            /*
                kwargs: {
                    instance
                    relatedObjects
                    forms
                    initialForms
                    prefix
                }
            */
            
            builtins.extend(this, kwargs);
        }
        ,save: function(settings){
            var
                useAjax
                ,result
                ,data= {}
                ,commit
                ,count= 0
                ,formSet= this
            ;
            
            settings= settings || {};
            commit= settings.commit || false;
            //useAjax= settings.useAjax || broke.conf.settings.AJAX;
            
            // formset management data
            data[this.prefix+'-TOTAL_FORMS']= this.forms.length;
            data[this.prefix+'-INITIAL_FORMS']= this.initialForms;
            
            // get this formset instance's data
            broke.extend(data, this.instance.getData());
            
            // formset's forms data
            builtins.forEach(this.forms, function(){
                
                broke.extend(data, this.save({
                    prefix: formSet.prefix + '-' + count + '-'
                }));
                
                count+= 1;
            });
            
            if(settings.extraData){
                broke.extend(data, settings.extraData);
            }
            
            if(useAjax) {
                
                result= saveAsAjaxRequest(data);
                
            } else {
                
                result= saveAsFormPost(data);
                
            }
            
            return result;
        }
    });
})();