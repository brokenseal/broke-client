(function(context, undefined){
	var
		patterns= broke.conf.urls.defaults.patterns
	;
	
	todo.urls= patterns('todo.views',
		[ '^$', 'list' ]
        ,[ '^/task/view/([0-9]+)/', 'view' ]
        ,[ '^/task/create/([0-9]+)/', 'create' ]
        ,[ '^/task/update/([0-9]+)/', 'update' ]
        ,[ '^/task/delete/([0-9]+)/', 'delete' ]
	);
})(this);