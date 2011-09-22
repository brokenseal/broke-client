(function(context, undefined){
    var
        update= broke.shortcuts.node.update
    ;

    blog.views= {
        list: function(request, callback){
            
            blog.models.Entry.objects.all(function(entryList){

                update({
                    htmlNode: '#container'
                    ,template: 'list'
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