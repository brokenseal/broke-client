/*
 * Broke-client - Davide Callegari - http://www.brokenseal.it/
 * 
 * Inspired by the Django Web Framework - http://www.djangoproject.com/
 * A lot of inspirement/copy from other Javascript Libraries like:
 *  - jQuery - http://jquery.com/
 *  - JavascriptMVC - http://javascriptmvc.com/
 * 
 * Licensed under MIT.
 * 
 */
var broke= {};

;(function(__global__, undefined){
    var
        extend= function() {
            var
                name,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false,
                options,
                src,
                copy
            ;

            if(arguments.length > 2) {
                broke.extend.apply(broke, arguments.slice(1));
            }
            // copy reference to target object
            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }
            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && !(target instanceof Function)) {
                target = {};
            }
            // extend broke itself if only one argument is passed
            if ( length == i ) {
                target = this;
                --i;
            }
            while(i < length) {
                // Only deal with non-null/undefined values
                if ( (options = arguments[ i ]) !== null ) {
                    // Extend the base object
                    for ( name in options ) {
                        if(options.hasOwnProperty(name)) {
                            src = target[ name ];
                            copy = options[ name ];

                            // Prevent never-ending loop
                            if ( target === copy ) {
                                continue;
                            }
                            // Recurse if we're merging object values
                            if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
                                target[ name ]= broke.extend( deep, src || ( copy.length !== null ? [ ] : { } ), copy );
                            }

                            // Don't bring in undefined values
                            else if ( copy !== undefined ) {
                                target[ name ] = copy;
                            }
                        }
                    }
                }

                i++;
            }
            // Return the modified object
            return target;
        }
        ,bindEvents= function(){
            var
                callback
                ,oldHash
                ,settings= broke.conf.settings
            ;
            
            /******************************** EVENTS BINDING ********************************/
            // elements binding
            if(settings.EVENT_TRIGGERING_METHOD == 'elements'){
                // --------- on elements ---------
                broke.bindEvents();
            
            // hash change binding
            } else if(settings.EVENT_TRIGGERING_METHOD == 'hashchange'){
                
                // if it does not exist, let's create it
                if(!('onhashchange' in window)){
                    oldHash= location.hash;
                    
                    setInterval(function(){
                        if(location.hash !== oldHash) {
                            oldHash= location.hash;

                            broke.DOM.e.trigger(window, 'hashchange');
                        }
                    }, settings.HASHCHANGE_INTERVAL);
                }
                
                // bind on hash change
                window.onhashchange= function(e){
                    broke.events.request({
                        event: e
                        ,url: location.hash.split('#')[1]
                    });
                };
            }
        }
        ,initProject= function(){
            var
                settings= broke.conf.settings
            ;
                
            // init installed apps' models
            settings.INSTALLED_APPS= builtins.map(settings.INSTALLED_APPS, function(){
                var
                    app= this
                ;
                
                if(builtins.typeOf(app) == "string") {
                    app= builtins.getattr(this);
                }
                
                if(!app) {
                    return null;
                }
                
                // init app's models
                builtins.forEach(app.models, function(){
                    var
                        tableName
                        ,defaultDbEngine
                    ;
                    
                    if(this.isUsable === false) {
                        return;
                    }
                    
                    defaultDbEngine= builtins.getattr(broke.conf.settings.DATABASES['default'].ENGINE);
                    defaultDbEngine.initTableForModel(this);
                    
                    // is this still useful?
                    //if(settings.ENABLE_FETCH_REMOTE_DATA && this.autoInit) {
                        // init the local storage data
                        //broke.initStorage(this);
                    //}
                    
                    broke.db.models.addContentType(this.appLabel, this.__name__.toLowerCase(), this);
                });

                return app;
            });
            
            return settings;
        }
    ;

    extend(broke, {
        /**************************** VERSION ********************************/
        VERSION: "0.2b"
        
        /************************ SETTINGS OBJECT ****************************/
        ,BROKE_SETTINGS_OBJECT: null    // it points to the registered project's settings
                                        // equivalent of Django's DJANGO_SETTINGS_MODULE
        
        /****************************** INIT *********************************/
        ,init: function(settingsObject, callback){
            var
                settings= broke.conf.settings
                ,currentUrl= location.hash.split('#')[1] || ''
            ;
            
            if(broke.events.isReady()) {
                // already initialized
                broke.log('Broke has already been initialized! Fail silently...');
                return;
            }
            
            if(!broke.BROKE_SETTINGS_OBJECT && !settingsObject) {
                // no settings object defined, fail out loud
                broke.log(gettext.gettext('Settings object not defined!'));
                
                return;
            } else if(!broke.BROKE_SETTINGS_OBJECT && settingsObject) {

                if(builtins.typeOf(settingsObject) == "string") {
                    settingsObject= builtins.getattr(settingsObject);
                }
                
                extend(settings, settingsObject);
            } else {
                extend(settings, builtins.getattr(broke.BROKE_SETTINGS_OBJECT));
            }
            
            // init project
            initProject();
            
            //if(settings.USE_I18N) {
                // determine the language
                //_setLanguage();
                
                // get language files
                //_getLanguageFiles();
            //}

            // bind events
            bindEvents();

            if(builtins.typeOf(callback) == "function") {
                callback();
            }
            
            // cache init
            //broke.core.cache.cache= broke.core.cache.getCache(settings.CACHE_BACKEND);
            
            // on broke init, request the current hash value, even if it's an empty string
            broke.events.request(currentUrl);

            broke.events.ready();
        }
        ,extend: extend
        ,log: function(debugString, doNotAppendDate){
            if(broke.conf.settings.DEBUG && 'console' in window) {
                if(!doNotAppendDate) {
                    var now= new Date();
                    now= builtins.interpolate('%s:%s:%s:%s', [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()]);
                    debugString= builtins.interpolate('[%s] %s', [now, debugString]);
                }
                
                console.debug(debugString);
            }
        }
        ,bindEvents: function(context, applyToContext){
            var
                settings= broke.conf.settings
                ,callback= function(e){
                    var
                        tag= this.tagName.toLowerCase()
                        ,urlChangingElement= settings.URL_CHANGING_ELEMENTS[tag]
                        ,preventDefault= urlChangingElement.preventDefault !== undefined ? urlChangingElement.preventDefault : settings.PREVENT_DEFAULT
                        ,urlAttribute= urlChangingElement.urlAttribute
                        ,url= broke.DOM.attr(this, urlAttribute)
                        ,type= e.target.tagName.toLowerCase() == "form" ? 'POST' : 'GET'
                    ;

                    if(url !== undefined && url.indexOf('#') >= 0) {
                        if(preventDefault) {
                            e.preventDefault();
                        }

                        broke.events.request({
                            event: e,
                            url: url.split('#')[1],
                            completeUrl: url,
                            type: type
                        });
                    }
                }
            ;
            context= context || document;

            // collect all the url changing elements
            builtins.forEach(settings.URL_CHANGING_ELEMENTS, function(key){
                var
                    domQueryResult
                ;
                
                if(applyToContext === true) {
                    domQueryResult= context;
                } else {
                    domQueryResult= broke.DOM.q(key, context);
                }

                // bind only support, need to make delegate available and change settings
                broke.DOM.e.addListener(domQueryResult, this.events.join(','), callback);
            });
        }
        ,DOM: {}
        ,conf: {}
        ,core: {}
        ,db: {}
    });
})(this);