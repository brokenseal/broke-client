# google closure compiler
CLOSURE_COMPILER= 'java/closure-compiler.jar'

WHITESPACE_ONLY= 'WHITESPACE_ONLY'
SIMPLE_OPTIMIZATIONS= 'SIMPLE_OPTIMIZATIONS'
ADVANCED_OPTIMIZATIONS= 'ADVANCED_OPTIMIZATIONS'

CLOSURE_OPTIMIZATION= WHITESPACE_ONLY

# python porting of dean edward's javascript packer
PYTHON_JS_PACKER= 'python/jspacker.py'

# your packer choice
PACKER= CLOSURE_COMPILER

# settings
BROKE_BASE_PATH= '../source/'
OUTPUT_FILE= '../dist/broke-0.2.pack.js'

FILE_PATHS= (
	'broke.js',

	# adaptors
	'adaptors/jquery-adaptor.js',

	# conf
	'conf/settings.js',
	'conf/urls.js',

	#core
	'core/context_processors.js',
	'core/events.js',
	'core/exceptions.js',
	'core/pubsub.js',
	'core/urlresolvers.js',

	# db
	'db/routers.js',
	'db/storages.js',
	'db/engines.js',
	'db/models/fields.js',
	'db/models/query.js',
	'db/models/manager.js',
	'db/models/models.js',

	# forms
	'forms/forms.js',
	'forms/models.js',
    
	# file system
	'fs/fs.js',

	# template
	'template/template.js',
	'template/defaultfilters.js',
	'template/defaulttags.js',
	'template/loader.js',
	'template/loaders.js',
	'template/nodes.js',
	'template/parser.js',

    # utils
    'utils/functional.js',
    'utils/translation.js',

    # views
    'views/views.js',

	'shortcuts.js',
)

#DEPENDENCIES_BASE_PATH= '../dependencies/'
#DEPENDENCIES_PATHS= (
#	'gettext.js',
#	'jquery-1.4.js',
#	'jquery.cookie.js',
#	'json.js',
#)
INCLUDE_DEPENDENCIES= False