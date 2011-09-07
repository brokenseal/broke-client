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
        ,val: function(object, value){
            var
                result= jQuery.fn.val(object, value)
            ;
            
            return value ? value : result;
        }
        ,attr: function(object, attributeName, value){
            return jQuery.fn.attr(object, attributeName, value);
        }
        ,html: function(element, htmlString){
            jQuery.fn.html(element, htmlString);
            
            return element;
        }
        ,manipulation: {
            append: function(elementToAppend, parentElement){
                jQuery.fn.append(parentElement, elementToAppend);

                return elementToAppend;
            }
            ,clone: function(object){
                return jQuery.fn.clone(object, false);
            }
            ,create: function(elementName, properties){
                return jQuery('<' + elementName + ' />', properties);
            }
            ,createFromString: function(htmlString){
                var
                    html= $(htmlString)
                ;
                
                return html.length ? [].concat(html) : html[0];
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