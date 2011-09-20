/* 
 * Django template engine based on the porting made by xiaocong.hust and John.Sec.Huang
 * http://code.google.com/p/jtl-javascript-template/
 * MIT Licensed
 * 
 */

(function(){
    broke.template= {
        // constants
        TOKEN_TEXT: 0,
        TOKEN_VAR: 1,
        TOKEN_BLOCK: 2,
        TOKEN_COMMENT: 3,
        
        _and: 0,
        _or: 1,
        
        // template syntax constants
        FILTER_SEPARATOR: '|',
        FILTER_ARGUMENT_SEPARATOR: ':',
        VARIABLE_ATTRIBUTE_SEPARATOR: '.',
        BLOCK_TAG_START: '{%',
        BLOCK_TAG_END: '%}',
        VARIABLE_TAG_START: '{{',
        VARIABLE_TAG_END: '}}',
        COMMENT_BLOCK_TAG_START: '{#',
        COMMENT_TAG_END: '#}',
        SINGLE_BRACE_START: '{',
        SINGLE_BRACE_END: '}',
        
        tagList: {},
        filterList: {},
        register: {
            tag: function(tagName, fn) {
                broke.template.tagList[tagName]= fn;
            },
            filter: function(filterName, fn) {
                broke.template.filterList[filterName]= fn;
            }
        }
        ,getVar: function(context, varstr) {
            return builtins.getattr(varstr, context);
        }
    };
    
    Class.create({
        __name__: "broke.template.Template"
        ,__init__: function(tpl){
            this._nodelist = this._compile(tpl);
        }
        ,_compile: function(tpl){
            var tokens,
                tagStr= this._formRegx(),
                tagRe= new RegExp(tagStr, 'g'),
                bits= [],
                originalBits= builtins.bsplit(tpl, tagRe);
            
            builtins.forEach(originalBits, function(){
                if(this != "") {
                    bits.push(this);
                }
            });
            
            // create token
            tokens= builtins.map(bits, function(){
                var tagToken;
                
                if(builtins.startsWith(this, template.BLOCK_TAG_START)) {
                    tagToken= this.slice(template.BLOCK_TAG_START.length, -template.BLOCK_TAG_END.length);
                    return new template.Token(template.TOKEN_BLOCK, tagToken);
                }
                else if(builtins.startsWith(this, template.VARIABLE_TAG_START)) {
                    return new template.Token(template.TOKEN_VAR, this.slice(template.VARIABLE_TAG_START.length, -template.VARIABLE_TAG_END.length));
                } else {
                    return new template.Token(template.TOKEN_TEXT, this);
                }
            });
            
            return (new template.Parser(tokens)).parse();
        },
        _formRegx: function(){
            var ret = '';
            
            ret += '(' + builtins.rescape(template.BLOCK_TAG_START) + '.*?' + builtins.rescape(template.BLOCK_TAG_END) + 
            '|' + builtins.rescape(template.VARIABLE_TAG_START) + '.*?' + builtins.rescape(template.VARIABLE_TAG_END) + '|$' + ')';
            
            return ret;
        },        
        render: function(context){
            var result= [];
            
            builtins.forEach(this._nodelist, function(){
                if(typeof(this) == 'object') {
                    typeof(this.render) == 'function' ?
                        (result.push(this.render(context)))
                        :
                        (result.push(this.toString()));
                } else {
                    result.push(this.toString());
                }
            });
            
            return broke.template.defaultFilters.escape(result.join(''));
        }
    });
    broke.template.Template.listRender= function(context, nodelist) {
        var result= [];
        
        builtins.forEach(nodelist, function(){
            result.push(this.render(context));
        });
        
        return result.join('');    
    };
    
    Class.create({
        __parent__: window
        ,__name__: "broke.template.Token"
        ,__init__: function(type, content){
            this.type= type;
            
            if(this.type !== template.TOKEN_TEXT) {
                // remove trailing and leading white spaces
                content= content.replace(/^\s+|\s+$/g, '');
            }
            
            this.content= content;
        },
        tsplit: function(){}
    });
})();
