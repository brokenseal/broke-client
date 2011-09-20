(function(context, undefined){
	var
		HOSTMAP = {
			'development': [
				'localhost'
			]
            ,test: [
                ''
            ]
			,'staging': []
			,'production': []
		}
        
		,production = {
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
		}
        
        ,development= production
        ,test= production
	;

    blog.settings= {
        development: development
        ,staging: production
        ,production: production
    };
	
	builtins.forEach(HOSTMAP, function(key){
		builtins.forEach(this, function(){
			
			if(location && location.host == this) {
				builtins.extend(exports, settings[key]);
			}
			
		});
	});
})(this);