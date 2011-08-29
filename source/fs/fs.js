/**
 * Heavily inspired by http://www.html5rocks.com/en/tutorials/file/filesystem/
 */

(function(__global__, undefined){
    var
        requestFileSystem= __global__.requestFileSystem || __global__.webkitRequestFileSystem
        ,KB= 1024
        ,MB= KB * KB
        ,GB= MB * KB
        ,TB= GB * KB
        ,DEFAULT_SIZE= 1 * KB
        ,fireCallbacks= function(callbacks){
            var
                len
                ,fireCallback= function(cb, innerArgs){
                    cb.apply(this, innerArgs);
                }
                ,args= Array.prototype.slice.call(arguments, 1)
            ;
            
            len= callbacks.length;
            while(len--) {
                // fire the callback function as soon as possible, without blocking the UI
                setTimeout(fireCallback, 0, callbacks[len], args);
            }
        }
    ;
    
    broke.fs= {
        KB: KB
        ,MB: MB
        ,GB: GB
        ,TB: TB

        // declared classes
        ,FileSystem: null
        ,TemporaryFileSystem: null
        ,DirectoryEntry: null
        ,FileEntry: null
    };
    
    Class.create({
        __name__: "broke.fs.FileSystem"
        ,__init__: function(size, callback){
            var
                instance= this
            ;
            size= size || DEFAULT_SIZE;

            if(callback) {
                this._readyCallbacks.push(callback);
            }
            
            // trying to use the file system API on a not standard browser
            if(requestFileSystem === undefined) {
                throw new Error("This browser does not support the HTML5 file system API.");
            }
            
            requestFileSystem(this._type, size, function(fs){
                instance.fs= fs;
                instance._currentDirectory= fs.root;

                fireCallbacks(instance._readyCallbacks, fs);
            }, function(error){
                instance.error= error;

                fireCallbacks(instance._errorCallbacks, error);
            });
            
            return this;
        }
        
        ,fs: null
        ,error: null
        ,type: __global__.PERSISTENT
        
        ,_readyCallbacks: []
        ,_errorCallbacks: []
        ,_currentDirectory: null

        ,isInitialized: function(){
            return new Boolean(this.fs || this.error);
        }
        ,onReady: function(callback){
            this._readyCallbacks.push(callback);
            
            if(this.isInitialized()) {
                callback(this.fs);
            }

            return this;
        }
        ,onError: function(callback){
            this._errorCallbacks.push(callback);
            
            if(this.isInitialized()) {
                callback(this.error);
            }

            return this;
        }

        // common fs operations
        ,moveTo: function(path, callback){
            var
                instance= this
            ;
            
            this.onReady(function(){
                instance.fs.root.getDirectory(path, {
                    create: false
                }, function(directoryEntry){
                    if(!doNotChangeCurrentDirectory) {
                        instance._currentDirectory= directoryEntry;
                    }
                    
                    callback.call(instance, broke.fs.DirectoryEntry(directoryEntry));

                }, function(error){
                    fireCallbacks(instance._errorCallbacks, error);
                });
            });
            
            return this;
        }
        ,makeDir: function(path, callback){
            var
                instance= this
                ,folders= path.split('/')
                ,startDirectory
                ,createDir= function(directoryEntry, directoryName){
                        
                    // if a directory name has been passed, then create it inside the current directory
                    if(directoryName) {
                        directoryEntry.getDirectory(directoryName, { create: true }, function(newDirectoryEntry){
                            // recursively call createDir
                            createDir(newDirectoryEntry, folders.shift());
                        }, function(error){
                            fireCallbacks(instance._errorCallbacks, error);
                        });
                    } else {
                        // we reached the end of the folders, fire the callback function with the last directory as argument
                        callback.call(instance, broke.fs.DirectoryEntry(directoryEntry));
                    }
                }
            ;

            this.onReady(function(){
                if(folders[0] == ''){
                    // a path starting from the root has been given, move to the root directory
                    startDirectory= instance.fs.root;
                    folders.shift();
                } else {
                    startDirectory= this._currentDirectory;
                }
                
                createDir(startDirectory, folders.shift());
            });
        }
        ,open: function(fileName, callback){
            var
                instance= this
            ;

            this.onReady(function(){
                instance._currentDirectory.getFile(fileName, {
                    create: true
                    ,exclusive: false
                }, function(fileEntry){

                    callback.call(instance, broke.fs.FileEntry(fileEntry));

                }, function(error){
                    fireCallbacks(instance._errorCallbacks, error);
                });
            });
            
            return this;
        }
        ,list: function(callback){
            var
                instance= this
            ;

            this.onReady(function(){
                var
                    reader= instance._currentDirectory.createReader()
                    ,entries= []
                    ,readEntries= function(){
                        reader.readEntries(function(results){
                            if(results.length) {
                                entries= entries.concat(Array.prototype.slice.call(results));

                                readEntries();
                            } else {
                                callback.call(instance, entries.sort());
                            }
                        });
                    }
                ;
                
                readEntries();
            });
        }
        ,remove: function(path){
            var
                instance= this
                ,removeDirectoryCallback= function(directoryEntry){
                    directoryEntry.removeRecursively(function(){}, function(error){
                        fireCallbacks(instance._errorCallbacks, error);
                    });
                }
            ;

            this.onReady(function(){
                if(/^\//.test(path)) {
                    instance.fs.root.getDirectory(path, removeDirectoryCallback, function(error){
                        fireCallbacks(instance._errorCallbacks, error);
                    });
                } else {
                    instance._currentDirectory.getDirectory(path, removeDirectoryCallback, function(error){
                        fireCallbacks(instance._errorCallbacks, error);
                    });
                }
            });
        }
    });
    
    FileSystem.create({
        __name__: "broke.fs.TemporaryFileSystem"
        ,_type: __global__.TEMPORARY
    });

    Class.extend({
        __name__: "broke.fs.FileEntry"
        ,__init__: function(fileEntry){
            this.fileEntry= fileEntry;
        }
    });

    Class.extend({
        __name__: "broke.fs.DirectoryEntry"
        ,__init__: function(directoryEntry){
            this.directoryEntry= directoryEntry;
        }
    });
})(this);