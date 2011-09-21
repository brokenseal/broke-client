(function(context, undefined){
    var
        genericEntryView= [
            '<div class="entry">'
                ,'{{ object }}'
            ,'</div>'
        ].join('')
    ;

    blog.templates= {
        list: [
            '<div class="entry-list">'
                ,'{% for entry in entry_list %}'
                    ,genericEntryView
                ,'{% endfor %}'
            ,'</div>'
        ]
        ,view: genericEntryView
        ,create: ''
        ,update: ''
        ,'delete': ''
    };
})(this);