(function(context, undefined){
    context.todo= {};
    
    $(function(){
        broke.init('todo.settings', function(){
            // fill db
            todo.models.Task.objects.create({"pk": 1, "model": "todo.task", "fields": {"body": "1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "pub_date": "2009-10-21", "title": "Title A"}});
            todo.models.Task.objects.create({"pk": 2, "model": "todo.task", "fields": {"body": "2. Lorem ipsum dolor sit ametsuscipit turpis a sapien ultrices rat urna lobortis pellentesque.", "pub_date": "2009-10-21", "title": "Title B"}});
            todo.models.Task.objects.create({"pk": 3, "model": "todo.task", "fields": {"body": "3. Lorem ipsum dolor sit ametsuscipit turpis a sapien ultrices rat urna lobortis pellentesque.", "pub_date": "2009-10-21", "title": "Title C"}});
        });
    });

})(this);