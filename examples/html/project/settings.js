(function(context, undefined){
    
    todo.settings= {
        MIDDLEWARE_CLASSES: []
        ,DEBUG_PROPAGATE_EXCEPTIONS: true
        ,EVENT_TRIGGERING_METHOD: 'elements'
        ,LANGUAGE_CODE: 'en'
        ,TEMPLATE_LOADERS: [
            'broke.template.loaders.apps'
            ,'broke.template.loaders.remote'
        ]
        ,USE_I18N: true
        ,DEBUG: false
        ,GET_LATEST_BY: 'title'
        ,INSTALLED_APPS: [
            'blog'
        ]
        ,ROOT_URLCONF: 'todo.urls'
    };

})(this);