(function(context, undefined){
    
    blog.settings= {
        MIDDLEWARE_CLASSES: []
        ,DEBUG_PROPAGATE_EXCEPTIONS: true
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
        ,ROOT_URLCONF: 'blog.urls'
    };

})(this);