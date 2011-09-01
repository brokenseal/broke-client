/**
 * Heavily inspired by http://www.html5rocks.com/en/tutorials/file/filesystem/
 * API copied from NodeJS file system api at http://nodejs.org/docs/latest/api/fs.html which exposes standard POSIX functions
 */

// vim: set ts=4 sw=4 et:

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
            broke.fs.File(path, flags, callback);
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
                        if(fromFileName !== toFileName && fromDirectoryPath === toDirectoryPath) {
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
        ,__init__: function(path, flags, callback){
            /**
             * Available modes so far are read (r) and write (w) and read/write (rw)
             * Wanna help? Fork and make a pull request :)
             */
            var
                instance= this
                ,readModeEnabled= (/r/i).test(flags)
                ,writeModeEnabled= (/w/i).test(flags)
                ,binaryModeEnabled= (/b/i).test(flags)
            ;

            this._offset= 0;
            this._file= null;
            this._writer= null;
            this._binaryMode= binaryModeEnabled;

            getFileSystem(function(fs){
                fs.root.getFile(path, {
                        create: writeModeEnabled
                    }, function(fileEntry){
                        instance._fileEntry= fileEntry;

                        if(readModeEnabled) {
                            fileEntry.file(function(file){
                                instance._file= file;

                                if(!writeModeEnabled) {
                                    callback(null, instance);
                                }
                            }, function(error){
                                callback(error, null);
                            });
                        }

                        if(writeModeEnabled) {
                            instance._fileEntry.createWriter(function(fileWriter){
                                instance._writer= fileWriter;

                                callback(null, instance);
                            }, function(error){
                                callback(error, null);
                            });
                        }
                    }, function(error){
                        callback(error, null);
                    });
            });
        }
        ,close: function(){
            // do stuff
            this._file= null;
            this._writer= null;

            return this;
        }
        ,read: function(length, position, callback){
            var
                reader= new FileReader()
                ,pos= (position === null) ? this._offset : position
                ,blob= this._file.slice(pos, length)
            ;

            reader.onloadend = function(e) {
                // The callback is given the three arguments, (err, bytesRead, buffer).
                if(this.result !== null){
                    this._offset= pos + e.loaded;

                    callback(null, e.loaded, this.result);
                } else{
                    // TO DO -- An error object should be passed as the first parameter
                    callback(e, 0, null);
                }
            };

            if(this._binaryMode){
                // TO DO -- readAsBinaryString, readAsArrayBuffer or readAsDataURL ?
                reader.readAsBinaryString(file);
            } else{
                reader.readAsText(file);
            }
        }
        ,write: function(buffer, position, callback){
            var
                builder= __global__.BlobBuilder || __global__.WebKitBlobBuilder
                ,bb= new builder()
                ,pos= (position === null) ? this._offset : position
            ;

            this._writer.onwriteend = function(e) {
                this._offset= pos + e.loaded;

                // The callback will be given three arguments (err, written, buffer)
                // where written specifies how many bytes were written into buffer.
                callback(null, e.loaded, buffer);
            };

            this._writer.onerror = function(e) {
                this._offset= pos + e.loaded;

                // TO DO -- An error object should be passed as the first parameter
                callback(e, e.loaded, buffer);
            };

            bb.append(buffer);

            this._writer.seek(pos);

            if(this._binaryMode){
                // TO DO -- MIME Content-Type ?
                this._writer.write(bb.getBlob());
            } else{
                this._writer.write(bb.getBlob('text/plain'));
            }
        }
        ,truncate: function(len, callback){
            this._writer.truncate(len);

            callback(null);
        }
        ,seek: function(offset){
            this._offset= offset;
        }
        ,readLine: function(size){}
        ,readLines: function(size){}
    });

    Class.extend({
        __name__: "broke.fs.Directory"
        ,__init__: function(directoryEntry){
            this.directoryEntry= directoryEntry;
        }
    });
})(this);

