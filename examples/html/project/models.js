(function(context, undefined){
    var
        models= broke.db.models
        ,fields= broke.db.fields
    ;

    todo.models= {};

    models.Model.create({
        __name__: "todo.models.Entry"
        ,title: fields.CharField({ max_length: 200 })
        ,body: fields.TextField()
        // TODO
        //,pub_date: fields.DateField()
    });
})(this);