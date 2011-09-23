;(function(__global__, undefined){
    var
        querySelectorCache= {}
    ;
    
    broke.extend(broke.DOM, {
        querySelector: function(query, context){
            var
                queryResult
            ;

            if(broke.conf.settings.ADAPTOR_CACHE_ENABLED && querySelectorCache[query]) {
                return querySelectorCache[query];
            }
            
            context= context || document;
            queryResult= [].concat(jQuery(query, context));

            if(broke.conf.settings.ADAPTOR_CACHE_ENABLED) {
                querySelectorCache[query]= queryResult;
            }

            return queryResult;
        }
        ,clearCache: function(){
            querySelectorCache= {};

            return;
        }
        ,val: function(object, value){
            var
                result= jQuery(object).val(value)
            ;
            
            return value ? value : result;
        }
        ,attr: function(attributeName, value){
            return jQuery(object).attr(object, attributeName, value);
        }
        ,html: function(element, htmlString){
            jQuery(element).html(htmlString);
            
            return element;
        }
        ,manipulation: {
            append: function(elementToAppend, parentElement){
                jQuery(parentElement).append(elementToAppend);

                return elementToAppend;
            }
            ,clone: function(object){
                return jQuery(object).clone(false)[0];
            }
            ,create: function(elementName, properties){
                return jQuery('<' + elementName + ' />', properties);
            }
            ,createFromString: function(htmlString){
                var
                    html= jQuery(htmlString)
                ;
                
                return html.length > 1 ? html.get() : html.get(0);
            }
            ,filter: function(elements, filterExpression){
                return [].concat($(elements).filter(filterExpression));
            }
            ,replace: function(firstElement, secondElement){
                $(firstElement).replaceWith(secondElement);

                return firstElement;
            }
        }
        // events naming follow jquery convention, stripping down the initial 'on' and keeping everything lower case
        // e.g. onClick -> click, onSubmit -> submit
        ,events: {
            addListener: function(object, eventName, callback){
                jQuery(object).bind(eventName, callback);
                
                return object;
            }
            ,removeListener: function(object, eventName, callback){
                jQuery(object).unbind(eventName, callback);

                return object;
            }
            ,trigger: function(object, eventName, args){
                jQuery(object).trigger(eventName, args);

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