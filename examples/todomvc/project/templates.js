(function(context, undefined){
    var
        genericTaskTemplate= '<li class="item">'+
            '<input type="checkbox" />' +
            '<span>{{ task.title }}</span>' +
            '<a class="edit" href="#/task/edit/{{ task.pk }}/"></a>' +
            '<a class="destroy" href="#/task/delete/{{ task.pk }}/"></a>' +
        '</li>'
    ;

    todo.templates= {
        list: '<ul class="items">' +
            '{% for task in taskList %}' +
                genericTaskTemplate +
            '{% endfor %}' +
        '</ul>'
        ,view: genericTaskTemplate
        ,create: ''
        ,update: ''
        ,'delete': ''
    };
})(this);