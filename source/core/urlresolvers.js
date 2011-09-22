;(function(__global__, undefined){
	var
		exceptions= broke.exceptions
        ,settings= broke.conf.settings
	;
	
	broke.urlResolvers= {
        resolve: function(url, args, urlPatterns) {
            var
                view= null
                ,match= null
                ,i
                ,urlPattern
            ;

            urlPatterns= urlPatterns || builtins.getattr(settings.ROOT_URLCONF);
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

            urlPatterns= urlPatterns || builtins.getattr(settings.ROOT_URLCONF);
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
        ,replaceNamedUrls: function(){
            // TODO: is this really useful? Should I refactor it to search named urls on templates only?
            /*
             * Search for named urls on the page and swap them with full qualified urls
             * Named urls on the page should look like this:
             *     #entry-commit     ->    /blog/entry/commit/
             *     #entry-view       ->    /blog/entry/view/2/
             *     #entry-edit 21,2  ->    /blog/21/entry/edit/2/
             *
             * If any arguments are needed, they will have to be a comma separated
             * series of values after the named url
             *
             */

            var
                callback= function(urlChangingElement){
                    var
                        attr= broke.DOM.attr
                        ,urlAttribute= urlChangingElement.urlAttribute
                        ,urlToRender= attr(this, urlAttribute).split('#')[1] || ''
                        ,namedUrl
                        ,args
                        ,result
                    ;

                    if(attr(this, urlAttribute).contains('#')) {
                        urlToRender= urlToRender.trim().split(' ');

                        namedUrl= urlToRender[0];
                        args= urlToRender[1];
                        if(args) {
                            args= args.split(',');
                        } else {
                            args= [];
                        }

                        try {

                            result= broke.urlResolvers.reverse(namedUrl, args);
                            attr(this, urlAttribute, '#' + result);

                        } catch(e) {
                            if(e.name == "NoReverseMatch") {
                                return;
                            }
                        }
                    }
                }
            ;

            builtins.forEach(broke.conf.settings.URL_CHANGING_ELEMENTS, function(key){
                var
                    elements= broke.DOM.querySelector(key)
                    ,elementsLength= elements.length
                ;
                
                while(elementsLength--) {
                    callback.call(elements[elementsLength], this);
                }
            });
        }
    };
})(this);