(function(){
    var
        tpl= broke.template
        ,TemplateSyntaxError= broke.exceptions.TemplateSyntaxError
    ;
    
    Class.create({
        __parent__: window
        ,__name__: "broke.template.Parser"
        ,__init__: function(tokens){
            this.tokens= tokens;
        },
        parse: function(parseUntil){
            var
                nodelist = []
                ,token = null
                ,tagFuncName = null
                ,tagFunc = null
            ;
            
            if(!parseUntil) {
                parseUntil = [];
            }
            if(!(parseUntil instanceof Array)) {
                parseUntil= [parseUntil];
            }
            
            while(this.tokens.length){
                token= this.tokens.shift();
                
                if(token.type == tpl.TOKEN_TEXT){
                    nodelist.push(new tpl.TextNode(token.content));
                }
                else if(token.type == tpl.TOKEN_VAR){
                    nodelist.push(new tpl.VarNode(token.content));
                }
                else if(token.type == tpl.TOKEN_BLOCK) {
                    if(builtins.has(parseUntil, token.content)) {
                        this.prependToken(token);
                        return nodelist;
                    }
                    
                    tagFuncName= token.content.split(/\s+/)[0];
                    
                    if(!tagFuncName) {
                        throw TemplateSyntaxError(gettext.gettext('Empty Tag'));
                    }
                    tagFunc = tpl.tagList[tagFuncName];
                    
                    if(!tagFunc) {
                        throw TemplateSyntaxError(gettext.gettext('Unknow Tag'));
                    }
                    nodelist.push(tagFunc(this,token));
                }
            }
            return nodelist;
        },
        skipPast: function(endtag){
            var
                token = null
            ;
            
            while(this.tokens.length){
                token = this.tokens.shift();
                
                if(token.type == tpl.TOKEN_BLOCK && token.content == endtag){
                    return;
                }
            }
            throw TemplateSyntaxError(gettext.gettext('Not Closed Tag'));
        },
        prependToken: function(token){
            this.tokens.unshift(token);
        },
        nextToken: function(){
            return this.tokens.shift();
        },
        deleteFirstToken: function(){
            this.tokens.shift();
            return true;
        }
    });
})();