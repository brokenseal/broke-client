/**
 * Heavily inspired by http://www.html5rocks.com/en/tutorials/file/filesystem/
 * API copied from NodeJS file system api at http://nodejs.org/docs/latest/api/fs.html which exposes standard POSIX functions
 */

(function(__global__, undefined){
    var
        requestFileSystem= __global__.requestFileSystem || __global__.webkitRequestFileSystem
        ,settings= broke.conf.settings
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

                callback(fs);

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
    ;

    broke.fs= {
        KB: KB
        ,MB: MB
        ,GB: GB
        ,TB: TB
        
        // File.seek whence constants
        ,SEEK_SET: 0
        ,SEEK_CUR: 1
        ,SEEK_END: 2
        
        ,open: function(path, flags, callback){
            broke.fs.File(path, flags, callback);
        }
        ,unlink: function(path, callback){
            fs.root.getFile(path, {
                create: false
            }, function(fileEntry){
                fileEntry.remove(function(){
                    callback();
                }, function(error){
                    callback(error);
                });
            }, function(error){
                callback(error);
            });
        }
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
        ,rmdir: function(path, callback){
            getFileSystem(function(fs){
                fs.root.getDirectory(function(directoryEntry){
                    directoryEntry.removeRecursively(callback, callback);
                });
            });
        }
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

        // declared classes
        ,Directory: null
        ,File: null
        ,FileSystem: null
    };

    Class.create({
        __name__: "broke.fs.File"
        ,__init__: function(path, flags, callback){
            var
                instance= this
                ,mode= flags.charAt(0)
                ,readModeEnabled
                ,writeModeEnabled
                ,seekToEnd
                ,truncateFile
                ,createFile
                ,binaryModeEnabled= (/b/).test(flags)
            ;

            if(mode === 'r'){
                readModeEnabled= true;
                writeModeEnabled= (/[+]/).test(flags);
                seekToEnd= false;
                truncateFile= false;
                createFile= false;
            } else if(mode === 'w'){
                readModeEnabled= (/[+]/).test(flags);
                writeModeEnabled= true;
                seekToEnd= false;
                truncateFile= true;
                createFile= true;
            } else if(mode === 'a'){
                readModeEnabled= (/[+]/).test(flags);
                writeModeEnabled= true;
                seekToEnd= true;
                truncateFile= false;
                createFile= true;
            } else{
                readModeEnabled= false;
                writeModeEnabled= false;
                seekToEnd= false;
                truncateFile= false;
                createFile= false;
                if(callback){
                    // TO DO -- An error object should be passed as the first parameter
                    callback(true, null);
                    return;
                }
            }

            this._offset= 0;
            this._file= null;
            this._writer= null;
            this._binaryMode= binaryModeEnabled;

            getFileSystem(function(fs){
                fs.root.getFile(path, {
                        create: createFile
                    }, function(fileEntry){
                        instance._fileEntry= fileEntry;

                        if(readModeEnabled) {
                            fileEntry.file(function(file){
                                instance._file= file;
                                instance._slice= file.slice || file.webkitSlice;

                                if((!writeModeEnabled) || (writeModeEnabled && instance._writer)){
                                    if(callback){
                                        callback(null, instance);
                                    }
                                }
                            }, function(error){
                                if(callback){
                                    callback(error, null);
                                }
                            });
                        }

                        if(writeModeEnabled) {
                            instance._fileEntry.createWriter(function(fileWriter){
                                instance._writer= fileWriter;

                                if(truncateFile){
                                    instance.truncate(0)
                                }

                                if(seekToEnd){
                                    instance.seek(0, broke.fs.SEEK_END);
                                }

                                if((!readModeEnabled) || (readModeEnabled && instance._file)){
                                    if(callback){
                                        callback(null, instance);
                                    }
                                }
                            }, function(error){
                                if(callback){
                                    callback(error, null);
                                }
                            });
                        }
                    }, function(error){
                        if(callback){
                            callback(error, null);
                        }
                    });
            });
        }
        ,read: function(length, callback){
            var
                instance= this
                ,reader= new FileReader()
                ,endpos= ((length === undefined) || (length === null)) ? this._file.size : (this._offset + length)
                ,blob= this._slice.call(this._file, this._offset, endpos)
            ;

            reader.onload= function(event){
                // The callback is given the three arguments, (err, bytesRead, buffer).
                instance._offset+= event.loaded;

                if(callback){
                    callback(null, event.loaded, event.target.result);
                }
            };

            reader.onerror= function(error){
                if(callback){
                    callback(error, 0, null);
                }
            };

            reader.onabort= reader.onerror;

            if(this._binaryMode){
                // TO DO -- readAsBinaryString, readAsArrayBuffer or readAsDataURL ?
                reader.readAsBinaryString(blob);
            } else{
                reader.readAsText(blob);
            }
        }
        ,write: function(buffer, callback){
            var
                instance= this
                ,builderClass= __global__.BlobBuilder || __global__.WebKitBlobBuilder
                ,builderInstance= new builderClass()
            ;

            this._writer.onwrite= function(event){
                instance._offset+= event.loaded;

                // The callback will be given three arguments (err, written, buffer)
                // where written specifies how many bytes were written into buffer.
                if(callback){
                    callback(null, event.loaded, buffer);
                }
            };

            this._writer.onerror= function(error){
                // The operation may fail after writing some bytes.
                // The offset in the file has to be updated according to the bytes written before the error
                instance._offset+= error.loaded;

                if(callback){
                    callback(error, error.loaded, buffer);
                }
            };

            this._writer.onabort= this._writer.onerror;

            builderInstance.append(buffer);

            this._writer.seek(this._offset);

            if(this._binaryMode){
                // TO DO -- MIME Content-Type ?
                this._writer.write(builderInstance.getBlob());
            } else{
                this._writer.write(builderInstance.getBlob('text/plain'));
            }
        }
        ,truncate: function(len){
            var
                length= ((len !== undefined) && (len !== null)) ? len : this._offset
            ;

            if(this._offset > length){
                this._offset= length;
                this._writer.seek(length);
            }

            this._writer.truncate(length);
        }
        ,tell: function(){
            return this._offset;
        }
        ,seek: function(offset, whence){
            if(whence === broke.fs.SEEK_CUR){
                // Relative to current position
                this._offset+= offset;
            } else if(whence === broke.fs.SEEK_END){
                // Relative to file end
                if(this._writer){
                    this._offset= this._writer.length + offset;
                } else if(this._file){
                    this._offset= this._file.size + offset;
                }
            } else{
                // Absolute indexing
                this._offset= offset;
            }

            return this;
        }
        ,rewind: function(){
            this._offset= 0;
        }
        ,readLine: function(size){}
        ,readLines: function(size){}
    });

    Class.create({
        __name__: "broke.fs.Directory"
        ,__init__: function(directoryEntry){
            this.directoryEntry= directoryEntry;
        }
        ,read: function(){}
    });
})(this);