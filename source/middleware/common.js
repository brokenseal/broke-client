;(function(undefined){
    broke.extend(broke.middleware, {
        common: {
            CommonMiddleware: {
                processResponse: function(response){
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