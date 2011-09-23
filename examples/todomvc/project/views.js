(function(context, undefined){
    var
        create= broke.shortcuts.node.create
    ;

    todo.views= {
        list: function(request, callback){

            todo.models.Task.objects.all(function(taskList){
                
                create({
                    htmlNode: '#content'
                    ,emptyHtmlNodeFirst: true
                    ,template: 'list'
                    ,object: taskList
                    ,context: {
                        taskList: taskList
                    }
                    ,callback: function(){
                        alert(11);
                    }
                });

            });
            
        }
        ,view: function(request, taskId, callback){
            console.log("VIEW");
        }
        ,create: function(request){
            console.log("CREATE");
        }
        ,update: function(request, taskId, callback){
            console.log("UPDATE");
        }
        ,'delete': function(request, taskId, callback){
            console.log("DELETE");
        }
    };
})(this);