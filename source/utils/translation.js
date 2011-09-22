;(function(undefined){
    
	broke.extend(broke.utils, {
        translation: {
            getLanguageFiles: function(){
                var
                    settings= broke.conf.settings
                    ,languageCode= settings.LANGUAGE_CODE
                    ,localePath= builtins.interpolate('/locale/%s/LC_MESSAGES/broke.po', languageCode)
                    ,localePaths= [
                        settings.BASE_URL + '/conf'
                    ]
                ;

                // projects' locale paths
                localePaths.populate(settings.LOCALE_PATHS);

                builtins.forEach(localePaths, function(){
                    gettext.init({
                        url: this + localePath
                    });
                });

                return;
            }
            ,setLanguage: function(){
                // 1. look in the url
                var queryString= broke.urlResolvers.parseQueryString(location.href.split('?')[1]),
                    cookie= $.cookie(settings.LANGUAGE_COOKIE_NAME),
                    langCodeFromCookie;

                // check query string
                if('language' in queryString) {
                    settings.LANGUAGE_CODE= queryString.language;

                    // set cookie language
                    $.cookie(settings.LANGUAGE_COOKIE_NAME, queryString.language, {
                        expires: 30,
                        domain: location.host,
                        path: '/'
                    });
                } else {
                    // 2. check cookie
                    langCodeFromCookie= $.cookie(settings.LANGUAGE_COOKIE_NAME);

                    settings.LANGUAGE_CODE= langCodeFromCookie || settings.LANGUAGE_CODE;
                }
            }
            ,gettext: function(){}
        }
	});
    
})();