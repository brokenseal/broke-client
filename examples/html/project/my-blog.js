(function(context, undefined){
    context.blog= {};

    $(function(){
        broke.init('blog.settings');

        // fill db
        blog.models.Entry.object.create({"pk": 1, "model": "blog.entry", "fields": {"body": "1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "pub_date": "2009-10-21", "title": "Title A"}});
        blog.models.Entry.object.create({"pk": 2, "model": "blog.entry", "fields": {"body": "2. Lorem ipsum dolor sit ametsuscipit turpis a sapien ultrices rat urna lobortis pellentesque.", "pub_date": "2009-10-21", "title": "Title B"}});
        blog.models.Entry.object.create({"pk": 3, "model": "blog.entry", "fields": {"body": "3. Lorem ipsum dolor sit ametsuscipit turpis a sapien ultrices rat urna lobortis pellentesque.", "pub_date": "2009-10-21", "title": "Title B"}});
    });

})(this);