(function(){
    var
        tpl= broke.template,
        register= tpl.register,
        TemplateSyntaxError= broke.exceptions.TemplateSyntaxError
    ;
    
    register.tag('if', function(parser, token){
        var
            bits = token.content.split(/\s+/)
            ,linkType
            ,nodeListTrue
            ,nodeListFalse
            ,bitstr
            ,boolPairs
        ;
        
        bits.shift();
        
        if(!bits){
            throw TemplateSyntaxError(gettext.gettext('If node need at least one args'));
        }
        
        bitstr= bits.join(' ');
        
        boolPairs= bitstr.split(' or ');
        
        if(boolPairs.length == 1){
            linkType = tpl.IfNode._and;
            boolPairs = bitstr.split(' and ');
        } else {
            linkType = tpl.IfNode._or;
            
            if(bitstr.indexOf(' and ') != -1) {
                throw TemplateSyntaxError(gettext.gettext('If node do not allow mix "and" & "or"'));
            }
        }
        
        nodeListTrue = parser.parse(['else','endif']);
        token= parser.nextToken();
        
        if(token.content.indexOf('else') != -1){
            nodeListFalse = parser.parse('endif');
            parser.deleteFirstToken();
        } else {
            nodeListFalse = [];
        }
        return new tpl.IfNode(linkType, boolPairs, nodeListTrue, nodeListFalse);	
    });
    
    register.tag('ifequal', function(parser, token){
        var
            bits = token.content.split(/\s+/)
            ,nodeListTrue
            ,nodeListFalse
            ,bitstr
            ,boolPairs
        ;
        
        bits.shift();
        
        if(bits.length < 2){
            throw TemplateSyntaxError(gettext.gettext('Ifequal node need at least two args'));
        }
        
        nodeListTrue = parser.parse(['else','endifequal']);
        token= parser.nextToken();
        
        if(token.content.indexOf('else') != -1){
            nodeListFalse = parser.parse('endifequal');
            parser.deleteFirstToken();
        } else {
            nodeListFalse = [];
        }
        
        return new tpl.IfEqualNode(bits, nodeListTrue, nodeListFalse);	
    });
    
    register.tag('comment', function(parser, token){
        parser.skipPast('endcomment');
        return new tpl.CommentNode();
    });
    
    register.tag('for', function(parser, token) {
        var
            bits = token.content.split(/\s+/),
            loopvar= bits[1],
            sequence= bits[3],
            reversed= (bits.length == 5),
            nodeListLoop= parser.parse('endfor')
        ;
        
        if(bits.length == 5 && bits[4] != 'reversed'){
            throw TemplateSyntaxError(gettext.gettext('The 4 args of for tag must be reversed'));
        }
        if(!builtins.has([4, 5], bits.length)) {
            throw TemplateSyntaxError(gettext.gettext('The for tag should have 4 or 5 args'));
        }
        if(bits[2] != 'in'){
            throw TemplateSyntaxError(gettext.gettext('The 2nd args of for tag must be "in"'));
        }
        
        parser.deleteFirstToken();
        return new tpl.ForNode(loopvar,sequence,reversed,nodeListLoop);
    });
    
    register.tag('url', function(parser, token) {
        var
            bits = token.content.split(/\s+/)
            ,viewName= bits[1]
            ,args= bits[2].split(',')
            ,asVar
        ;
        
        if(bits.length == 5){
            if(bits[3] != 'as') {
                throw TemplateSyntaxError(gettext.gettext('The 3 args of for tag must be "as"'));
            }
            asVar= bits[3];
        }
        
        return new tpl.UrlNode(viewName, args, asVar);
    });
})();