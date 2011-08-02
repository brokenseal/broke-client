(function(){
	var
		NoReverseMatch= broke.exceptions.NoReverseMatch
	;
	
	broke.extend({
		urlResolvers: {
			patterns: function(prefix) {
				var
					args= Array.prototype.slice.call(arguments)
				;
				
				return builtins.map(args.slice(1), function(){
					if(typeof this[1] == "string") {
						this[1]= builtins.getattr(prefix + "." + this[1]);
					}
					return this;
				});
			},
			include: function(urlObject){
				if(typeof urlObject == "string") {
					return builtins.getattr(urlObject);
				}
				return urlObject;
			},
			parseQueryString: function(queryString){
				var result= {};
				if(!queryString) {
					return {};
				}
				
				queryString= queryString.split('&');
				
				builtins.forEach(queryString, function(){
					var tmp= this.split('=');
					result[tmp[0]]= tmp[1];
				});
				
				return result;
			},
			parsePath: function(path){
				if(!path) {
					return [];
				}
				
				return path.split('/').slice(1);
			},
			resolve: function(url, args, urlPatterns) {
				var
					view= null
					,match= null
					,i
					,_this
				;
				
				urlPatterns= urlPatterns || broke.urlPatterns;
				args= args || [];
				
				for(i= 0; i< urlPatterns.length; i++) {
					_this= urlPatterns[i];
					
					match= url.match(_this[0]);
					
					if(match) {
						if(match.length > 1) {
							args= args.concat(match.slice(1));
						}
						view= _this[1];
						
						if(builtins.typeOf(view) == "string") {
							view= builtins.getattr(view);
						}
						
						if(builtins.isFunction(view)) {
							
							return [view, args];
							
						} else if(builtins.isArray(view)) {
							
							url= url.replace(match[0], '');
							return broke.urlResolvers.resolve(url, args, view);
							
						}
					}
				}
				
				throw broke.exceptions.NotFound(gettext.gettext('Matching url not found.'));
			},
			reverse: function(namedUrl, args, urlPatterns, result) {
				var match= null,
					i,
					isInclude,
					_this;
				
				urlPatterns= urlPatterns || broke.urlPatterns;
				result= result || '';
				args= args || [];
				
				for(i= 0; i< urlPatterns.length; i++) {
					_this= urlPatterns[i];
					
					if(builtins.typeOf(_this[1]) == "string") {
						_this[1]= builtins.getattr(_this[1]);
					}
					
					isInclude= builtins.isArray(_this[1]);
					
					if(isInclude) {
						match= builtins.startsWith(namedUrl, _this[2]);
					} else {
						match= (namedUrl == _this[2]);
					}
					
					if(match) {
						if(isInclude) {
							namedUrl= namedUrl.replace(_this[2] + '-', '');
							return broke.urlResolvers.reverse(namedUrl, args, _this[1], _this[0]);
						} else {
							result+= _this[0];
							result= builtins.interpolate(args, result.replace('^', '').replace('$', '').replace(/\(.*?\)/g, '%s'));
							
							if(result.match(_this[0])) {
								return result;
							} else {
								return '';
							}
						}
					}
				}
				
				// no matching url found
				throw NoReverseMatch(gettext.gettext('Matching url not found.'));
				
				return null;
			}
		}
	});
})();
