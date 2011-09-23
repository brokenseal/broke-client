(function(context, undefined){
    var
        genericEntryView= [
            '<div class="entry">'
                ,'{{ entry.fields.title }}'
            ,'</div>'
        ].join('')
    ;

    todo.templates= {
        list: [
            '<div class="entry-list">'
                ,'{% for entry in entry_list %}'
                    ,genericEntryView
                ,'{% endfor %}'
            ,'</div>'
        ].join('')
        ,view: genericEntryView
        ,create: ''
        ,update: ''
        ,'delete': ''
    };
})(this);