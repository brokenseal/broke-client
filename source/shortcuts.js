;(function(undefined){
    var
        applyContextProcessors= function(response){
            builtins.forEach(broke.conf.settings.CONTEXT_PROCESSORS, function(){
                var contextProcessor= builtins.getattr(this);
                
                broke.extend(response.context, contextProcessor(response));
            });
            
            return response.context;
        }
    ;
    
    broke.shortcuts= {
        node: {
            create: function(response){
                /* response= {
                 *     template: compulsory template
                 *     context: template's context
                 *     method: after|before|append|prepend|wrap. it defaults to 'append'
                 *     htmlNode: node or string to search the node,
                 *         to which append the newly created node.
                 *         it defaults to 'body'
                 *     additionalProperties: additional properties to append to the
                 *         newly created htmlNode
                 *     callback: a function that gets applied to the newly created htmlNode
                 * }
                 *
                 */
                var
                    allowedMethods= ['after', 'before', 'append', 'prepend', 'wrap']
                    ,context= applyContextProcessors(response)
                    ,renderedTemplate= broke.template.loader.renderToString(response.template, context)
                    ,newElement= broke.DOM.m.createFromString(renderedTemplate)
                ;

                // default arguments
                response= broke.extend({
                    method: 'append',
                    htmlNode: 'body'
                }, response);
                
                if(!builtins.has(allowedMethods, response.method)) {
                    throw broke.exceptions.NotImplementedError(builtins.interpolate(gettext.gettext("The selected template's method (%s) is not implemented. Options are: after, before, append, prepend, wrap"), response.method));
                }
                
                // append support only, for now
                broke.DOM.m.append(newElement, response.htmlNode);
                
                response.element= newElement;
                
                return response;
            }
            ,replace: function(response){
                /*
                 * Renders the template and then replace the element with the
                 * rendered template
                 * response= {
                 *     template: compulsory template
                 *     context: template's context
                 *     htmlNode: node or string to search the node,
                 *         with which replace the newly created node
                 *     additionalProperties: additional properties to append to the
                 *         newly created htmlNode
                 *     callback: a function that gets applied to the newly created htmlNode
                 * }
                 *
                 */
                var
                    context= applyContextProcessors(response)
                    ,renderedTemplate= broke.template.loader.renderToString(response.template, context)
                    ,newElement= broke.DOM.m.createFromString(renderedTemplate)
                ;
                
                // replace
                broke.DOM.m.replace(response.htmlNode, newElement);
                
                response.element= newElement;
                
                return response;
            }
            ,update: function(response){
                /*
                 response= {
                 *     object: object with which update the html node
                 *     htmlNode: node or string to search the node to update
                 *     attribute: rel|class
                 *     childrenOnly: whether you want to search direct descendant only
                 *         for optimizations purpose or all the descendants
                 *     additionalProperties: additional properties to append to the
                 *         every single updated node
                 *     callback: a function that gets applied to the newly created htmlNode
                 * }
                 *
                 * This method expect the html node to have children with 
                 * the rel or class attribute corresponding to fields of the object
                 *
                 * i.e.
                 *     object's fields: {
                 *         title: 'New title',
                 *         description: 'New description',
                 *     }
                 *     html node: 
                 *     <ul>
                 *         <li rel="title">My title</li>
                 *         <li rel="description">My description</li>
                 *     </ul>
                 *	
                 * would become:
                 *
                 *     html node: <ul>
                 *         <li rel="title">New title</li>
                 *         <li rel="description">New description</li>
                 *     </ul>
                 *
                 * WARNING: quite resource heavy on big html nodes
                 * TODO: optimize
                 *	
                 */
                var
                    acceptedAttributes= ['class', 'rel']
                    ,searchFor
                ;
                
                // default arguments
                response= broke.extend({
                    attribute: 'rel',
                    childrenOnly: true
                }, response);
                
                searchFor= response.childrenOnly ? '> *' : '*';
                
                if(!builtins.has(acceptedAttributes, response.attribute)) {
                    throw broke.exceptions.NotImplementedError(builtins.interpolate(gettext.gettext("You can not use %s's attribute. Options are: class, rel"), response.attribute));
                }

                builtins.forEach(broke.DOM.querySelector(searchFor, response.htmlNode), function(){
                    var
                        attr= broke.DOM.attr
                        ,key
                    ;
                    
                    for(key in response.object.fields) {
                        
                        if(response.object.fields.hasOwnProperty(key) && attr(this, response.attribute) !== undefined) {
                            
                            if(attr(this, response.attribute).contains(key)) {
                                // update the node
                                broke.DOM.html(this, response.object.fields[key]);
                            }
                        }
                    }
                });
                
                response.element= response.htmlNode;
                
                return true;
            }
        }
    };
})();