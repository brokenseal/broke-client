import os

TMP_FILE= 'tmp.out'

def build(output_file= None, settings_file='client_settings'):
    settings= __import__(settings_file)
    js_to_pack= ''
    paths= []
    
    output_file= output_file or settings.OUTPUT_FILE
    
    # collect all the paths
    if settings.INCLUDE_DEPENDENCIES:
        for path in settings.DEPENDENCIES_PATHS:
            paths.append(settings.DEPENDENCIES_BASE_PATH + path)
    
    for path in settings.FILE_PATHS:
        paths.append(settings.BROKE_BASE_PATH + path)
    
    for path in paths:
        print 'Add script ' + path
        js_to_pack+= open(path, 'r').read()

    open(TMP_FILE, 'w').write(js_to_pack)
    
    # packer choice
    if settings.PACKER == settings.CLOSURE_COMPILER:
        os.system('java -jar %s --js tmp.out --js_output_file %s --compilation_level %s' % (settings.PACKER, output_file, settings.CLOSURE_OPTIMIZATION,))

    elif settings.PACKER == settings.PYTHON_JS_PACKER:
        from python.jspacker import pack

        pack((TMP_FILE,), output_file)

    # no known packer selected, fail
    else:
        print 'The selected packer (if any) is not available.'

    #os.remove(TMP_FILE)

if __name__ == '__main__':
    import sys
    output_file= '../dist/broke-client-latest.min.js'
    
    if len(sys.argv) == 2:
        output_file= sys.argv[1]
    
    build(output_file)
