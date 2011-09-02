(function(__global__, undefined){
	var
		exceptions= broke.exceptions
	;
	
	broke.urlResolvers= {
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
        }
        ,include: function(urlObject){
            if(typeof urlObject == "string") {
                return builtins.getattr(urlObject);
            }
            return urlObject;
        }
        ,parseQueryString: function(queryString){
            var
                result= {}
            ;

            if(!queryString) {
                return {};
            }

            queryString= queryString.split('&');

            builtins.forEach(queryString, function(){
                var tmp= this.split('=');
                result[tmp[0]]= tmp[1];
            });

            return result;
        }
        ,parsePath: function(path){
            if(!path) {
                return [];
            }

            return path.split('/').slice(1);
        }
        ,resolve: function(url, args, urlPatterns) {
            var
                view= null
                ,match= null
                ,i
                ,urlPattern
            ;

            urlPatterns= urlPatterns || broke.urlPatterns;
            args= args || [];

            for(i= 0; i< urlPatterns.length; i++) {
                urlPattern= urlPatterns[i];

                match= url.match(urlPattern[0]);

                if(match) {
                    if(match.length > 1) {
                        args= args.concat(match.slice(1));
                    }
                    view= urlPattern[1];

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

            throw exceptions.NotFound(gettext.gettext('Matching url not found.'));
        }
        ,reverse: function(namedUrl, args, urlPatterns, result) {
            var
                match= null
                ,i
                ,isInclude
                ,urlPattern
            ;

            urlPatterns= urlPatterns || broke.urlPatterns;
            result= result || '';
            args= args || [];

            for(i= 0; i< urlPatterns.length; i++) {
                urlPattern= urlPatterns[i];

                if(builtins.typeOf(urlPattern[1]) == "string") {
                    urlPattern[1]= builtins.getattr(urlPattern[1]);
                }

                isInclude= builtins.isArray(urlPattern[1]);

                if(isInclude) {
                    match= builtins.startsWith(namedUrl, urlPattern[2]);
                } else {
                    match= (namedUrl == urlPattern[2]);
                }

                if(match) {
                    if(isInclude) {
                        namedUrl= namedUrl.replace(urlPattern[2] + '-', '');
                        return broke.urlResolvers.reverse(namedUrl, args, urlPattern[1], urlPattern[0]);
                    } else {
                        result+= urlPattern[0];
                        result= builtins.interpolate(args, result.replace('^', '').replace('$', '').replace(/\(.*?\)/g, '%s'));

                        if(result.match(urlPattern[0])) {
                            return result;
                        } else {
                            return '';
                        }
                    }
                }
            }

            // no matching url found
            throw exceptions.NoReverseMatch(gettext.gettext('Matching url not found.'));

            return null;
        }
    };
})(this);