/**
 * Heavily inspired by http://www.html5rocks.com/en/tutorials/file/filesystem/
 * API copied from NodeJS file system api at http://nodejs.org/docs/latest/api/fs.html which exposes standard POSIX functions
 */

(function(__global__, undefined){
    var
        requestFileSystem= __global__.requestFileSystem || __global__.webkitRequestFileSystem
        ,defaultFileSystemType
        ,KB= 1024
        ,MB= KB * KB
        ,GB= MB * KB
        ,TB= GB * KB

        // utility functions
        ,getFileSystem= function(callback){
            var
                type= settings.FILE_SYSTEM.PERSISTENT ? __global__.PERSISTENT : __global__.TEMPORARY
            ;
            
            if(requestFileSystem === undefined) {
                throw new Error("This browser does not support the HTML5 file system API.");
            }
            
            requestFileSystem(type, settings.FILE_SYSTEM.SIZE, function(fs){

                callback(null, fs);

            }, function(error){
                throw error;
            });
            
        }
        /**
         * Splits directory from file from the path given
         */
        ,splitPath= function(path){
            var
                tmpSplitPath= path.split('/')
                ,dirPath= tmpSplitPath.slice(0, -1).join('/')
                ,fileName= tmpSplitPath.slice(-1)[0]
            ;
            
            return [ dirPath, fileName ];
        }
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

        ,open: function(path, flags, callback){
            /**
             * Available modes so far are read (r) and write (w) and read/write (rw)
             * Wanna help? Fork and make a pull request :)
             */
            var
                tmpSplitPath= splitPath(path)
                ,dirPath= tmpSplitPath[0]
                ,fileName= tmpSplitPath[1]
                ,readModeEnabled= (/\r/i).test(mode)
                ,writeModeEnabled= (/\w/i).test(mode)
            ;
            
            getFileSystem(function(fs){
                fs.root.getDirectory(dirPath, {
                    create: false
                }, function(dir){
                    dir.getFile(fileName, {
                        create: writeMode
                    }, function(fileEntry){
                        
                        broke.fs.File(fileEntry, readModeEnabled, writeModeEnabled, function(fileInstance){
                            callback(null, fileInstance);
                        });

                    }, function(){
                        callback(error, null);
                    });
                }, function(error){
                    callback(error, null);
                });
            });
        }
        //,openSync: function(path, flags, mode){}
        
        ,unlink: function(path, callback){
            open(path, function(error, fileObject){
                if(error) {
                    return callback(error);
                }
                
                fileObject._fileEntry.remove(function(){
                    callback();
                }, function(error){
                    callback(error);
                });
            });
        }
        //,unlinkSync: function(path){}
        
        ,rename: function(fromPath, toPath, callback){
            var
                tmpFromPath= splitPath(fromPath)
                ,tmpToPath= splitPath(toPath)
                ,fromDirectoryPath= tmpFromPath[0]
                ,fromFileName= tmpFromPath[1]
                ,toDirectoryPath= tmpToPath[0]
                ,toFileName= tmpToPath[1]
            ;
            
            getFileSystem(function(fs){
                fs.root.getDirectory(fromDirectoryPath, {}, function(directoryEntry){
                    directoryEntry.getFile(fromFileName, {}, function(fileEntry){
                        if(fromFileName != toFileName && fromDirectoryPath == toDirectoryPath) {
                            // simple renaming
                            fileEntry.moveTo(fromDirectoryPath, toFileName);
                        } else if(fromFileName != toFileName && fromDirectoryPath != toDirectoryPath){
                            // rename and move
                            fileEntry.moveTo(toDirectoryPath, toFileName);
                        } else if(fromDirectoryPath != toDirectoryPath){
                            // simple move
                            fileEntry.moveTo(toDirectoryPath);
                        }
                        
                        callback();
                    }, function(error){
                        callback(error);
                    });
                }, function(error){
                    callback(error);
                });
            });
        }
        //,renameSync: function(fromPath, toPath){}
        
        ,rmdir: function(path, callback){
            getFileSystem(function(fs){
                fs.root.getDirectory(function(directoryEntry){
                    directoryEntry.removeRecursively(callback, callback);
                });
            });
        }
        //,rmdirSync: function(path, callback){}
        
        ,mkdir: function(path, callback){
            var
                folders= path.split('/')
                ,startDirectory
                ,createDir= function(directoryEntry, directoryName){
                    
                    // if a directory name has been passed, then create it inside the current directory
                    if(directoryName) {
                        directoryEntry.getDirectory(directoryName, { create: true }, function(newDirectoryEntry){
                            // recursively call createDir
                            createDir(newDirectoryEntry, folders.shift());
                        }, function(error){
                            callback(error, null);
                        });
                    } else {
                        // we reached the end of the folders, fire the callback function with the last created directory as argument
                        callback(null, broke.fs.Directory(directoryEntry));
                    }
                }
            ;
            
            getFileSystem(function(fs){
                createDir(fs.root, folders.shift());
            });
        }
        //,mkdirSync: function(path, mode, callback){}

        ,readdir: function(path, callback){
            getFileSystem(function(fs){
                fs.root.getDirectory(function(directoryEntry){
                    var
                        reader= directoryEntry.createReader()
                        ,entries= []
                        ,readEntries= function(){
                            reader.readEntries(function(results){
                                if(results.length) {
                                    entries= entries.concat(Array.prototype.slice.call(results));

                                    readEntries();
                                } else {
                                    callback(null, entries);
                                }
                            });
                        }
                    ;
                    
                    readEntries();
                }, function(error){
                    callback(error, null);
                });
            });
        }
        //,readdirSync: function(path, callback){}
        
        //,close: function(fd, callback){}
        //,closeSync: function(fd){}
        //,write: function(fd, buffer, offset, length, position, callback){}
        //,writeSync: function(fd, buffer, offset, length, position){}
        //,writeSync: function(fd, str, position, encoding){}
        //,read: function(fd, buffer, offset, length, position, callback){}
        //,readSync: function(fd, buffer, offset, length, position){}
        //,readSync: function(fd, length, position, encoding){}
        //,readFile: function(filename, [encoding], callback){}
        //,readFileSync: function(filename, encoding){}
        //,writeFile: function(filename, data, encoding, callback){}
        //,writeFileSync: function(filename, data, encoding){}
        
        // declared classes
        ,Directory: null
        ,File: null
        ,Stats: null
    };
    
    Class.extend({
        __name__: "broke.fs.File"
        ,__init__: function(fileEntry, callback){
            var
                instance= this
            ;

            this._fileEntry= fileEntry;

            if(readModeEnabled) {
                this._fileEntry.file(function(file){
                    var
                        reader= new FileReader()
                    ;

                    reader.onloadend= function(e){
                        instance._reader= reader;

                        if(writeModeEnabled && instance._writer) {
                            callback(instance);
                        }
                    };

                    reader.readAsText(file);

                }, function(error){
                    callback(error);
                });
            }
            
            if(writeModeEnabled) {
                this._fileEntry.createWriter(function(fileWriter){
                    instance._writer= fileWriter;
                });
            }
        }
        ,_reader: null
        ,_writer: null
        ,closed: false
        ,close: function(){
            this.closed= true;
            // do stuff
            return this;
        }
        ,read: function(size, callback){}
        ,readLine: function(size){}
        ,readLines: function(size){}
        ,seek: function(offset){}
    });
    
    Class.extend({
        __name__: "broke.fs.Directory"
        ,__init__: function(directoryEntry){
            this.directoryEntry= directoryEntry;
        }
    });
})(this);