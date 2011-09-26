;(function(undefined){
    broke.conf.settings= {
        AJAX: {
            dataType: 'json' // ajax data type which returns from the server
            ,async: false
            ,cache: false
        }
        ,API_BASE_URL: '/api/'

        ,BASE_URL: '/broke'

        // cache system
        // broke implements only a local storage cache backend, for now
        ,CACHE_BACKEND: 'localStorage://'
        ,CACHE_MIDDLEWARE_SECONDS: 600
        ,CACHE_MIDDLEWARE_KEY_PREFIX: ''

        ,DATABASES: {
            'default': {
                NAME: ''
                ,ENGINE: 'broke.db.engines.LocalEngine'
                ,USER: ''
                ,PASSWORD: ''
            }
            ,'remote': {
                NAME: ''
                ,ENGINE: 'broke.db.engines.RemoteEngine'
                ,USER: ''
                ,PASSWORD: ''
                ,BASE_URL: '/api/'
            }
        }
        ,DATABASE_ROUTERS: ['broke.db.routers.DefaultRouter']

        ,DISALLOWED_USER_AGENTS: []

        ,DEBUG: false
        ,CONTEXT_PROCESSORS: []
        
        ,DATE_FORMAT: 'dd-mm-yy'
        ,ENABLE_FETCH_REMOTE_DATA: false
        ,EVENT_BINDING: 'live'          // bind|live
                                        // it should always be set to 'live' but
                                        // at the current stage jQuery's live
                                        // method does not alwasy work properly

        // 'EVENT_TRIGGERING_METHOD' determines the way to trigger the
        // broke.events.request event
        // WARNING: hashChange will work with an interval of 150ms on old browsers
        // on more recent browsers will make use of the 'onhashchange' event
        // which, by the time of the writing, it is only available on Firefox 3.6 and IE8
        // as for the 'elements' method please refer to the documentation under the
        // 'events' topic
        // choices are: elements, hashchange
        ,EVENT_TRIGGERING_METHOD: 'hashchange'

        ,FILE_SYSTEM: {
            SIZE: 5 * 1024 // 5 Kb default file system size
            ,PERSISTENT: true
            ,HOME_DIR: "/"
        }

        ,FORM: null                        // default operation form

        ,GET_LATEST_BY: 'pk'            // defines what field models' manager method
                                        // getLatest will look at

        ,HANDLER_404: 'broke.views.defaults.pageNotFound'

        ,HASHCHANGE_INTERVAL: 150        // interval in milliseconds for the
                                        // hashchange method to check for a changed
                                        // url
                                        // it's effective only if you've selected
                                        // 'eventTriggeringMethod' as 'hashchange'
                                        // and your browser does not support
                                        // the 'onhashchange' event

        ,HIDE_HASH: false                // whether you want the hash to be hidden
                                        // from the main url
                                        // careful: it will prevent any default action
                                        // from the browser from your event
                                        // equivalent to 'event.preventDefault();'

        ,JSON_URLS: null

        // locale specific settings
        ,LOCALE_PATHS: []
        ,LANGUAGE_CODE: 'en'
        ,LANGUAGES: {
            'en': 'English'
            ,'it': 'Italian'
        }
        ,LANGUAGE_COOKIE_NAME: 'broke_language'

        ,MIDDLEWARE_CLASSES: [
            'broke.middleware.common.CommonMiddleware'
        ]

        ,PREVENT_DEFAULT: false                // whether you want the broke.response to
                                            // prevent default action from the browser

        ,PRELOAD_REMOTE_TEMPLATES: false    // wether you want Broke to preload your templates
                                            // remotely
                                            // if set to true, Broke will attempt to download
                                            // your templates from a remote location
                                            // based on the basePath of your app
                                            // e.g.: if an app's baseDir is '/myProject/apps/blog'
                                            // and your app has a 'templates' object looks like
                                            // { 'entry-view.html': '' }, then Broke will try to
                                            // download '/myProject/apps/blog/templates/entry-view.html'

        ,QUERY_TYPE: 'local'            // local|remote
                                        // wether you want your query to hit a local database,
                                        // populated with previously fetched data,
                                        // or query the remote database
        ,RETURN: location.href        // form return url

        ,ROOT_URLCONF: null                // a string representing the object's configuration

        ,STOP_PROPAGATION: false        // whether you want the broke.response to
                                        // prevent event propagation

        ,SAVE: {
            async: false                // ajax or sjax?
            ,cache: false                // ajax cache
            ,commit: true                // if you want to prevent the object to
                                        // be saved right away, you should set this
                                        // to false and then explicitly call the
                                        // save method on the object with commit= true
                                        // e.g.: entry.save({commit: true})
                                        // if you actually want to save it on the server
        }
        ,TEMPLATE_STRING_IF_INVALID: ''
        ,TEMPLATE_PATHS: []
        ,TEMPLATE_LOADERS: [
            'broke.template.loaders.apps'
        ]

        // list of elements that trigger the
        // broke.events.request event, setting the url
        // WARNING: will only work if 'eventTriggeringMethod' is set to 'elements'
        ,URL_CHANGING_ELEMENTS: {
            'a': {
                events: ['click'],      // events
                urlAttribute: 'href'    // attribute holding the url
            }
            ,'form': {
                events: ['submit'],
                urlAttribute: 'action',
                preventDefault: true
            }
        }
        ,USE_AJAX: true                 // would you like to use ajax?
                                        // if false, it will create a form and
                                        // send your data through that form
                                        // WARNING: not ready yet!

        ,USE_I18N: false
        ,USE_NAMED_URLS: false
    };
})();