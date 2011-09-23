(function(context, undefined){
    var
        models= broke.db.models
    ;

    todo.models= {};

    models.Model.create({
        __name__: "todo.models.Task"
        ,title: models.CharField({ max_length: 200 })
        ,body: models.TextField()
        // TODO
        //,pub_date: fields.DateField()
    });
})(this);