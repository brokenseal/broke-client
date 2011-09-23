(function(context, undefined){
	var Template= broke.template.Template;
	
	broke.extend(broke.template, {
		loader: {
			renderToString: function(templateName, context){
				var i,
					loader,
					template;
				
				for(i= 0; i< broke.conf.settings.TEMPLATE_LOADERS.length; i++) {
					loader= broke.conf.settings.TEMPLATE_LOADERS[i];
					
					if(builtins.typeOf(loader) == "string") {
						loader= builtins.getattr(loader);
					}
					
					if((template= loader.loadTemplate(templateName))) {
						break;
					}
				};
				
				if(template) {
					return Template(template).render(context);
				}
				
				// no template found
				return '';
			}
		}
	});
})(this);