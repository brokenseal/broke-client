(function(context, undefined){
    var
        remoteModels= [
            'SlideContent'
            ,'Event'
            ,'PageTour'
            //,'PageTourStep'
        ]
        ,remoteModelsForRead= remoteModels.concat([])
        ,remoteModelsForWrite= remoteModels.concat([
            'Occurrence'
            //,'Slide'
        ])
    ;

    broke.db.routers= {};

    Class.create({
        __name__: "broke.db.routers.DefaultRouter"
        ,dbForRead: function(model, hints){
            if(builtins.has(remoteModelsForRead, model.__name__)) {
                return 'remote';
            }
        }
        ,dbForWrite: function(model, hints){
            if(builtins.has(remoteModelsForWrite, model.__name__)) {
                return 'remote';
            }
        }
    });
})(this);