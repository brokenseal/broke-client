(function(context, undefined){
	var
		patterns= broke.conf.urls.defaults.patterns
	;
	
	blog.urls= patterns('blog.views',
		[ '^$', 'list' ]
        ,[ '^/entry/view/([0-9]+)/', 'view' ]
        ,[ '^/entry/create/([0-9]+)/', 'create' ]
        ,[ '^/entry/update/([0-9]+)/', 'update' ]
        ,[ '^/entry/delete/([0-9]+)/', 'delete' ]
	);
})(this);