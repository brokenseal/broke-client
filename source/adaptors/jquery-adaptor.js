;(function(__global__, undefined){
    var
        querySelectorCache= {}
    ;
    
    broke.extend(broke.DOM, {
        querySelector: function(query, context){
            var
                queryResult
            ;

            context= context || document;
            queryResult= jQuery(query, jQuery(context));
            
            return queryResult;
        }
        ,clearCache: function(){
            querySelectorCache= {};

            return;
        }
        ,val: function(object, value){

            if(value !== undefined) {
                jQuery(object).val(value);

                return object;
            }

            return jQuery(object).val();
        }
        ,attr: function(object, attributeName, value){
            if(value !== undefined) {
                jQuery(object).attr(attributeName, value);

                return value;
            }
            
            return jQuery(object).attr(attributeName);
        }
        ,removeAttr: function(object, attributeName){
            jQuery(object).removeAttr(attributeName);
            
            return object;
        }
        ,html: function(element, htmlString){
            jQuery(element).html(htmlString);
            
            return element;
        }
        ,text: function(element, text){
            jQuery(element).text(text);
            
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
                return jQuery(elements).filter(filterExpression);
            }
            ,replace: function(firstElement, secondElement){
                jQuery(firstElement).replaceWith(secondElement);

                return firstElement;
            }
        }
        // events naming follow jquery convention, stripping down the initial 'on' and keeping everything lower case
        // e.g. onClick -> click, onSubmit -> submit
        ,events: {
            addListener: function(object, eventName, callback){
                
                if(builtins.isArray(object)) {

                    builtins.forEach(object, function(){
                        jQuery(this).bind(eventName, callback);
                    });
                    
                } else {
                    jQuery(object).bind(eventName, callback);
                }

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