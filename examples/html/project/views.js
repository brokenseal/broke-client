(function(context, undefined){
    var
        create= broke.shortcuts.node.create
    ;

    todo.views= {
        list: function(request, callback){

            todo.models.Task.objects.all(function(entryList){
                
                create({
                    htmlNode: '#tasks .list'
                    ,emptyHtmlNodeFirst: true
                    ,template: 'list'
                    ,object: entryList
                    ,context: {
                        entry_list: entryList
                    }
                    ,callback: function(){
                        alert(11);
                    }
                });

            });
            
        }
        ,view: function(request, entryId, callback){
            console.log("VIEW");
        }
        ,create: function(request){
            console.log("CREATE");
        }
        ,update: function(request, entryId, callback){
            console.log("UPDATE");
        }
        ,'delete': function(request, entryId, callback){
            console.log("DELETE");
        }
    };
})(this);