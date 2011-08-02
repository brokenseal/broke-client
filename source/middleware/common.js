 /*
  * A middleware should implement at least one of this two methods:
  * - processRequest
  * - processResponse
  * 
  */

/************************* DEFAULT MIDDLEWARE ****************************/
(function(){
    broke.extend(broke.middleware, {
        common: {
            CommonMiddleware: {
                processResponse: function(response){
                    // Check for denied User-Agents
                    // DISALLOWED_USER_AGENTS
                    
                    // Check for a redirect based on settings.APPEND_SLASH
                    // and settings.PREPEND_WWW
                    
                    // hide hash
                    if(response.event !== undefined) {
                        if(broke.conf.settings.HIDE_HASH || broke.conf.settings.PREVENT_DEFAULT) {
                            response.event.preventDefault();
                        }
                        
                        // stop propagation
                        if(broke.conf.settings.STOP_PROPAGATION) {
                            response.event.stopPropagation();
                        }
                        
                        if(response.preventDefault === false && response.event.isDefaultPrevented()) {
                            location.hash= response.url;
                        }
                    }
                    
                    return this;
                }
            }
        }
    });
})();