;(function(undefined){
    var
        settings= broke.conf.settings
        ,NotImplementedError= broke.exceptions.NotImplementedError
        ,BaseEngine
        ,LocalEngine
        ,OPERATIONS= {
            SELECT: 'select'
            ,INSERT: 'insert'
            ,UPDATE: 'update'
            ,DELETE: 'delete'
        }
        ,filterOperations= {
            contains: function(first, second){
                if(first.match(second)) {
                    return true;
                }
                return false;
            }
            ,iContains: function(first, second){
                return this.contains(first.toString().toLowerCase(), second.toString().toLowerCase());
            }
            ,startsWith: function(first, second){
                if(first.match("^" + second)) {
                    return true;
                }
                return false;
            }
            ,iStartsWith: function(first, second){
                    return this.startsWith(first.toString().toLowerCase(), second.toString().toLowerCase());
            }
            ,endsWith: function(first, second){
                if(first.match(second + "$")) {
                    return true;
                }
                return false;
            }
            ,iEndsWith: function(first, second){
                return this.EndsWith(first.toString().toLowerCase(), second.toString().toLowerCase());
            }
            ,exact: function(first, second){
                if(first.match("^" + second + "$")) {
                    return true;
                }
                return false;
            }
            ,iExact: function(first, second){
                return this.exact(first.toString().toLowerCase(), second.toString().toLowerCase());
            }
            ,'in': function(first, second){
                return builtins.has(second, first);
            }
            ,gt: function(first, second){
                return first > second;
            }
            ,gte: function(first, second){
                return first >= second;
            }
            ,lt: function(first, second){
                return first < second;
            }
            ,lte: function(first, second){
                return first <= second;
            }
            ,regex: function(first, second){
                return first.match(second);
            }
            ,iRegex: function(first, second){
                return this.regex(first.toString().toLowerCase(), second.toString().toLowerCase());
            }
            ,isNull: function(first, second) {
                return (first === null || first === undefined) ? second : !second;
            }
            ,year: function(first, second) {
                return (new Date(first).getFullYear()) == second;
            }
            ,month: function(first, second) {
                return (new Date(first).getMonth() + 1) == second;
            }
            ,day: function(first, second) {
                return (new Date(first).getDate()) == second;
            }
            ,weekDay: function(first, second) {
                return (new Date(first).getDay()) == second;
            }
            ,range: function(first, second) {
                return (second[0] <= first) && (first <= second[1]);
            }
        }
        ,applyFilters= function(engine, data, args, negate){
            var
                Model= broke.db.models.Model
            ;
            negate= negate === undefined ? true : negate;

            return builtins.filter(data, function(){
                var
                    splitData= null
                    ,filterOperation= null
                    ,key= null
                    ,newKey= null
                    ,relatedObjectFilterOptions= {}
                    ,relatedResult
                    ,value
                    ,data= this
                ;
                
                for(key in args) {
                    if(args.hasOwnProperty(key)) {
                        
                        /*if(!(key in this.fields)) {
                            throw broke.exceptions.FieldError(builtins.interpolate(gettext.gettext("The specified field (%s) is not available."), key));
                        }*/
                        
                        splitData= key.split('__');
                        
                        if(splitData.length > 1) {
                            newKey= splitData[0];
                            filterOperation= splitData[1];
                            
                            if(filterOperation in filterOperations) {
                                
                                if(!filterOperations[filterOperation](this.fields[newKey], args[key])) {
                                    return !negate;
                                }
                                
                            } else if(builtins.typeOf(this.fields[newKey]) == "object"){
                                try {
                                    relatedResult= builtins.getattr(splitData.join('.'), this.fields, null);
                                    
                                    if(relatedResult == args[key]) {
                                        return negate;
                                    }
                                    
                                } catch(e) {}
                                
                                return !negate;
                                
                            } else {
                                throw broke.exceptions.NotImplementedError(builtins.interpolate(gettext.gettext("Filter operation '%s' not implemented."), filterOperation));
                            }
                        } else if(args[key] instanceof Model && this.fields[key] instanceof Model) {
                            try {
                                    if(args[key].pk !=  this.fields[key].pk) {
                                            return !negate;
                                    }
                            } catch(e) {}
                            
                            return negate;
                            
                        } else if(key == "pk" && this[key] == args[key]) {
                            return negate;
                        } else if(this.fields[key] != args[key]) {
                            return !negate;
                        }
                    }
                }
                return negate;
            });
        }
        ,saveRelatedObjectsOnLocalEngine= function(objects){
            
            builtins.forEach(objects, function(){
                var
                    object= this
                ;
                
                builtins.forEach(this.fields, function(key){
                    var
                        relatedField
                    ;
                    
                    if(builtins.typeOf(this) == "array") {
                        relatedField= object[key];
                        
                        if(relatedField) {
                            builtins.forEach(this, function(){
                                LocalEngine({
                                    model: relatedField.model
                                    ,args: {
                                        insert: this
                                    }
                                    ,operation: OPERATIONS.INSERT
                                }).execute();
                            });
                        }
                    }
                    
                });
                
            });
        }
    ;

    broke.db.engines= {
        OPERATIONS: OPERATIONS
    };

    BaseEngine= Class.create({
        __name__: "broke.db.engines.BaseEngine"
        ,__init__: function(kwargs){
            this.model= kwargs.model;
            this.args= kwargs.args;
            this.operation= kwargs.operation;
            this.settings= kwargs.settings;
            this.object= kwargs.object;
        }
        ,select: function(){
            throw NotImplementedError("You need to implement this method on every class that extends this one.");
        }
        ,insert: function(){
            throw NotImplementedError("You need to implement this method on every class that extends this one.");
        }
        ,update: function(){
            throw NotImplementedError("You need to implement this method on every class that extends this one.");
        }
        ,'delete': function(){
            throw NotImplementedError("You need to implement this method on every class that extends this one.");
        }
        ,execute: function(callback){
            var
                engine= this
                ,executeCallback= function(operationResult, status, xhr, error){
                    var
                        result
                    ;

                    if(operationResult && builtins.typeOf(operationResult) == "array") {

                        result= builtins.map(operationResult, function(){
                            return engine.model(this);
                        });

                        saveRelatedObjectsOnLocalEngine(result);

                    } else if(builtins.typeOf(operationResult) == "object") {
                        result= engine.model(operationResult);

                        saveRelatedObjectsOnLocalEngine([result]);
                    }
                
                    if(callback) {
                        callback(result, status, xhr, error);
                    }
                }
            ;

            return this[this.operation](executeCallback);
        }
    });

    LocalEngine= BaseEngine.create({
        __name__: "broke.db.engines.LocalEngine"
        ,storage: broke.storages.JSONSchema
        ,select: function(callback){
            var
                data= this.storage.getTable(this.model.getTableName())
            ;
            
            data= applyFilters(this, data, this.args.filter);
            data= applyFilters(this, data, this.args.exclude, true);

            callback(data);
        }
        ,insert: function(callback){
            var
                engine= this
                ,objects
                ,dataTableName= this.model.getTableName()
                ,data
            ;

            if(builtins.typeOf(this.args.insert) == "array") {
                data= [];

                builtins.forEach(this.args.insert, function(){
                    data.push(this.storage.set(dataTableName, this));
                });
            } else {
                data= this.storage.set(dataTableName, this.args.insert);
            }
            
            callback(data);
        }
        ,update: function(callback){
            return this.insert(callback);
        }
        ,'delete': function(callback){
            // TODO
        }
        ,orderBy: function(){
            // TODO
            /*
            var
                index= this.length
                ,fieldValueList= []
                ,tmpValue
                ,querySet= this
            ;
            
            //if(typeOf(field) != 'string' && typeOf(field) != 'number') {
            //	throw new TypeError('Order by works with strings and number types only!');
            //}
            
            while(index--) {
                tmpValue= querySet[index].fields[field];
                tmpValue= new tmpValue.constructor(tmpValue);
                
                tmpValue.__index__= index;
                fieldValueList.push(tmpValue);
            }
            fieldValueList.sort();
            
            builtins.forEach(fieldValueList, function(){
                var
                    obj= querySet[this.__index__]
                ;
                
                delete this.__index__;
                
                querySet.push(obj);
            });
            
            */
            
            return this;
        }
    });
    LocalEngine.initTableForModel= function(model, objects){
        return this.prototype.storage.initTableForModel(model, objects);
    };
    
    RemoteEngine= BaseEngine.create({
        __name__: "broke.db.engines.RemoteEngine"
        ,select: function(callback){
            return this._ajaxOperation({
                data: this.args.filter
                ,type: 'GET'
                //,success: function(data, status, xhr){
                //    callback(data, status, xhr);
                //}
            },callback);
        }
        ,insert: function(callback){
            return this._ajaxOperation({
                data: this.args.insert.fields
                ,type: 'POST'
                ,success: function(data, status, xhr){
                    data= builtins.typeOf(data) == "array" ? data[0] : data;
                    
                    if(callback){
                        callback(data, status, xhr, null);
                    }
                }
            }, callback);
        }
        ,update: function(callback){
            return this._ajaxOperation({
                data: this.args.update
                ,type: 'PUT'
                ,url: this.object.remoteUrls.update
                ,success: function(data, status, xhr){
                    data= builtins.typeOf(data) == "array" ? data[0] : data;
                    
                    if(callback){
                        callback(data, status, xhr);
                    }
                }
            }, callback);
        }
        ,'delete': function(callback){
            return this._ajaxOperation({
                type: 'DELETE'
                ,url: this.object.remoteUrls['delete']
            }, callback);
        }
        ,orderBy: function(){
            // TODO
        }
        ,_ajaxOperation: function(ajaxSettings, callback){
            ajaxSettings= broke.extend({
                async: this.settings.async
                ,cache: this.settings.cache === undefined ? false : this.settings.cache
                ,url: this.model.getBaseRemoteUrl()
                ,success: function(data, status, xhr){
                    if(callback){
                        callback(data, status, xhr);
                    }
                }
                ,error: function(xhr, status, error){
                    if(callback){
                        callback(null, status, xhr, error);
                    }
                }
            }, ajaxSettings);

            return $.ajax(ajaxSettings);
        }
    });
})();