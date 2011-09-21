(function(context, undefined){
    var
        models= broke.db.models
        ,fields= broke.db.fields
    ;

    blog.models= {};

    models.Model.create({
        __name__: "blog.models.Entry"
        ,title: fields.CharField({ max_length: 200 })
        ,body: fields.TextField()
        // TODO
        //,pub_date: fields.DateField()
    });
})(this);