;(function(__global__, undefined){
    var
        querySelectorCache= {}
        ,settings= broke.conf.settings
    ;
    
    broke.extend(broke.DOM, {
        querySelector: function(query, context){
            var
                queryResult
            ;

            if(settings.ADAPTOR_CACHE_ENABLED && querySelectorCache[query]) {
                return querySelectorCache[query];
            }
            
            context= context || document;
            queryResult= [].concat(jQuery(query, context));

            if(settings.ADAPTOR_CACHE_ENABLED) {
                querySelectorCache[query]= queryResult;
            }

            return queryResult;
        }
        ,clearCache: function(){
            querySelectorCache= {};

            return;
        }
        ,val: function(object){
            return jQuery.fn.val(object);
        }
        ,attr: function(object, attributeName){
            return jQuery.fn.attr(object, attributeName);
        }
        ,manipulation: {
            append: function(elementToAppend, parentElement){
                jQuery.fn.append(parentElement, elementToAppend);

                return elementToAppend;
            }
            ,create: function(elementName, properties){
                return jQuery('<' + elementName + ' />', properties);
            }
            ,clone: function(object){
                return jQuery.fn.clone(object, false);
            }
        }
        // events naming follow jquery convention, stripping down the initial 'on' and keeping everything lower case
        // e.g. onClick -> click, onSubmit -> submit
        ,events: {
            addListener: function(object, eventName, callback){
                jQuery.fn.bind(eventName, callback);
                
                return object;
            }
            ,removeListener: function(object, eventName, callback){
                jQuery.fn.unbind(object, eventName, callback);

                return object;
            }
            ,trigger: function(object, eventName){
                jQuery.fn.trigger(object, eventName);

                return object;
            }
            ,delegate: function(object, eventName){
                
            }
        }
    });

    // shortcuts
    broke.DOM.q= broke.DOM.querySelector;
    broke.DOM.m= broke.DOM.manipulation;
    broke.DOM.e= broke.DOM.events;
})(this);