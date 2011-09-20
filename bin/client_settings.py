import os

# google closure compiler
CLOSURE_COMPILER= 'java/closure-compiler.jar'

WHITESPACE_ONLY= 'WHITESPACE_ONLY'
SIMPLE_OPTIMIZATIONS= 'SIMPLE_OPTIMIZATIONS'
ADVANCED_OPTIMIZATIONS= 'ADVANCED_OPTIMIZATIONS'

CLOSURE_OPTIMIZATION= WHITESPACE_ONLY

# python porting of dean edward's javascript packer
PYTHON_JS_PACKER= 'python/jspacker.py'

# your packer choice
PACKER= PYTHON_JS_PACKER

# settings
BROKE_BASE_PATH= '../broke/'
OUTPUT_FILE= '../dist/broke-0.2.pack.js'

FILE_PATHS= []

# TODO: this needs to be changed onto something more dynamic
for root, dirs, files in os.walk(BROKE_BASE_PATH):
    for file in files:
        FILE_PATHS.append(os.path.join(root, dirs, file))

#DEPENDENCIES_BASE_PATH= '../dependencies/'
#DEPENDENCIES_PATHS= (
#	'gettext.js',
#	'jquery-1.4.js',
#	'jquery.cookie.js',
#	'json.js',
#)
INCLUDE_DEPENDENCIES= False