(function(__global__, undefined){
    /*
     * Request event handling
     * broke.request
     * 
     */
    
    broke.bindToRequest(function(e, request, extraArgs, responseCallback){
        var
            response= {}
            ,view= null
            ,callback
            ,args= null
            ,urlMatchResult= []
            ,partialUrl
            ,target
            ,parseQueryString= broke.urlResolvers.parseQueryString
            ,queryString= {}
            ,resolve= broke.urlResolvers.resolve
        ;
        
        extraArgs= extraArgs || [];
        
        request= broke.extend({
            completeUrl: window.location.href,
            method: 'GET',
            fromReload: false,
            statusCode: 200,
            META: {},
            GET: {},
            POST: {},
            REQUEST: {}
        }, request);
        
        if(!request.url) {
            return;
        }
        
        // set GET/POST/REQUEST
        partialUrl= request.url.split('?');
        if(partialUrl.length > 1) {
            request.url= partialUrl[0];
            queryString= parseQueryString(partialUrl[1]);
            
            request.GET= queryString;
        } else if('event' in request && request.event.target.tagName.toLowerCase() === "form"){
            target= $(request.event.target);
            
            target.find('input,select,textarea').each(function(){
                    var input= $(this);
                    queryString[input.attr('name')]= input.val();
            });
            
            request.POST= queryString;
        }
        request.REQUEST= queryString;
        
        // set META
        request.META= {
            HTTP_REFERER: window.location.href.split('#')[1] || ''
        };
        
        // middleware fetching
        builtins.forEach(broke.conf.settings.MIDDLEWARE_CLASSES, function(){
            var
                middleware= builtins.getattr(this, __global__, {})
            ;
            
            if(middleware.processRequest !== undefined) {
                middleware.processRequest.apply(this, [request].concat(extraArgs));
            }
        });
        
        // url dispatcher
        try {
            urlMatchResult= resolve(request.url);
        } catch(error) {
            if(error.name == "NotFound") {
                //builtins.getattr(broke.conf.settings.HANDLER_404)(request);
                broke.response(response);
                return;
                
            } else {
                throw error;
            }
        }
        
        if(urlMatchResult) {
            view= urlMatchResult[0];
            args= urlMatchResult[1];
            
            if(extraArgs) {
                args= args.concat(extraArgs);
            }
            
            // put the request object as the first argument
            args.unshift(request);
            
            // create the callback function for the response to be taken
            callback= function(response){
                response= broke.extend(request, response);
                broke.response(response, extraArgs, responseCallback);
            };
            
            // put the callback as the last argument
            args.push(callback);
            
            view.apply(this, args);
        }
    });
    
    /*
     * Response event handling
     * broke.response
     * 
     */
    broke.bindToResponse(function(e, response, extraArgs, responseCallback){
            
            extraArgs= extraArgs || [];
            
            // apply additional properties
            builtins.forEach(response.additionalProperties, function(key){
                response.element[key]= this;
            });
            
            // apply callback
            if(builtins.typeOf(response.callback) == 'function') {
                response.callback.apply(response.element);
            }
            
            // --------- middleware fetching in reverse order ---------
            builtins.forEach(broke.conf.settings.MIDDLEWARE_CLASSES.reverse(), function(){
                var
                    middleware= builtins.getattr(this, __global__, {})
                ;
                
                if(middleware.processResponse !== undefined) {
                    middleware.processResponse.apply(this, [response].concat(extraArgs));
                }
            });
    });
})(this);