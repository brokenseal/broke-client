(function(context, undefined){
    broke.conf.urls= {
        defaults: {
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
        }
    };
})(this);