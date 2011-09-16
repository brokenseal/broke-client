;(function(__global__, undefined){
    var
        isReady= false
        ,requestEventName= 'broke.request'
        ,responseEventName= 'broke.response'
        ,events= broke.DOM.events

        // utility functions
        ,fireCallbacks= function(callbacks, args){
            builtins.forEach(callbacks, function(){
                this.apply(__global__, args);
            });
        }
    ;
    
    broke.events= {
        isReady: function(){
            return isReady;
        }
        // used for internal purpose only
        ,ready: function(){
            isReady= true;
            events.trigger(window, 'broke.ready');
            
            // make sure no one else fires this
            delete broke.events.ready;
        }
        ,onReady: function(fn) {
            if(isReady) {
                fn();
            }
            
            events.addListener(window, 'broke.ready', fn);
        }
        ,unBindOnReady: function(fn){
            if(fn === undefined) {
                events.removeListener(window, 'broke.ready');
                return;
            }
            
            events.removeListener(window, 'broke.ready', fn);
        }
        ,preSave: function(klass, fn){
            var
                eventName= 'broke.' + klass.__name__.toLowerCase() + '.pre_save'
            ;

            events.addListener(window, eventName, fn);
        }
        ,postSave: function(klass, fn){
            var
                eventName= 'broke.' + klass.__name__.toLowerCase() + '.post_save'
            ;
            
            events.addListener(window, eventName, fn);
        }
        ,bindToRequest: function(fn){
            events.addListener(window, requestEventName, fn);
        }
        ,bindToResponse: function(fn){
            events.addListener(window, responseEventName, fn);
        }
        ,request: function(args, extraArgs){
            var
                req= {}
            ;

            if(builtins.typeOf(args) == 'string') {
                // first case: broke.events.request('/entry/view/1/');
                req.url= args;
            } else {
                // second case: broke.events.request({
                //     url: '/entry/view/1/',
                //     fromReload: true
                // });
                req= args;
            }

            events.trigger(window, requestEventName, fn);
            $window.trigger(requestEventName, [req, extraArgs]);
        }
        ,response: function(){
            $window.trigger(responseEventName, arguments);
        }

        // some class declarations
        ,Deferred: null
        ,When: null
    };

    // mime jquery deferred api (CommonJS Promises/A design)
    Class.create({
        __name__: "broke.events.Deferred"
        
        // should make these attributes private or at least very hard to access
        ,_resolved: false
        ,_rejected: false
        ,_onSuccessCallbacks: []
        ,_onErrorCallbacks: []
        ,_onCompleteCallbacks: []
        ,_completedWithArgs: null

        ,then: function(onSuccessCallback, onErrorCallback){

            if(this.isResolved()) {
                fireCallbacks(onSuccessCallback, this._completedWithArgs);
            } else if(this.isRejected()){
                fireCallbacks(onErrorCallback, this._completedWithArgs);
            }
            
            this._onSuccessCallbacks.push(onSuccessCallback);
            this._onErrorCallbacks.push(onErrorCallback);
            
            return this;
        }
        ,resolve: function(){
            if(this.isResolved()) {
                // refuse to resolve an already resolved deferred
                return this;
            }

            fireCallbacks(this._onSuccessCallbacks, arguments);
            fireCallbacks(this._onCompleteCallbacks, arguments);

            this._completedWithArgs= arguments;

            return this;
        }
        ,reject: function(){
            if(this.isRejected()) {
                // refuse to reject an already rejected deferred
                return this;
            }

            fireCallbacks(this._onErrorCallbacks, arguments);
            fireCallbacks(this._onCompleteCallbacks, arguments);
            
            this._completedWithArgs= arguments;

            return this;
        }
        ,isResolved: function(){
            return this._rejected;
        }
        ,isRejected: function(){
            return this._resolved;
        }
        ,always: function(){
            if(this.isResolved() || this.isRejected()) {
                fireCallbacks(arguments, this._completedWithArgs);
            }
            
            this._onCompleteCallbacks= this._onCompleteCallbacks.concat(arguments);
            
            return this;
        }
        
        ,done: function(){
            if(this.isResolved()) {
                fireCallbacks(arguments, this._completedWithArgs);
            }

            this._onSuccessCallbacks= this._onSuccessCallbacks.concat(arguments);

            return this;
        }
        ,fail: function(){
            if(this.isRejected()) {
                fireCallbacks(arguments, this._completedWithArgs);
            }

            this._onErrorCallbacks= this._onErrorCallbacks.concat(arguments);

            return this;
        }
    });
    
    Class.create({
        __name__: "broke.events.When"
        ,__init__: function(){
            this.deferreds= Array.prototype.slice.call(arguments);
        }
        ,then: function(onSuccessCallback, onErrorCallback){

            var
                trackCompletion= function(){
                    completedDeferredsLength+= 1;

                    if(completedDeferredsLength == this.deferreds.length) {
                        
                    }
                }
                ,completedDeferredsLength= 0
            ;

            this.deferreds[0]

            this.deferreds.each(function(){
                this.always(trackCompletion);
            });
            
            return this;
        }
    });
    
    // Request event handling
    broke.events.bindToRequest(function(e, request, extraArgs, responseCallback){
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
            builtins.forEach(broke.DOM.q('inputy,select,textarea', request.event.target), function(){
                queryString[input.attr('name')]= broke.DOM.val(this);
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

    // Response event handling
    broke.events.bindToResponse(function(e, response, extraArgs, responseCallback){

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