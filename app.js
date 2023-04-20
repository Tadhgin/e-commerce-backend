// Import required modules
var finalhandler = require('finalhandler');
var Router = require('./router');
var methods = require('methods');
var middleware = require('./middleware/init');
var query = require('./middleware/query');
var debug = require('debug')('express:application');
var View = require('./view');
var http = require('http');
var compileETag = require('./utils').compileETag;
var compileQueryParser = require('./utils').compileQueryParser;
var compileTrust = require('./utils').compileTrust;
var deprecate = require('depd')('express');
var flatten = require('array-flatten');
var merge = require('utils-merge');
var resolve = require('path').resolve;
var setPrototypeOf = require('setprototypeof');

// Define variables
var hasOwnProperty = Object.prototype.hasOwnProperty;
var slice = Array.prototype.slice;

// Export app object
var app = exports = module.exports = {};

// Define trust proxy default symbol
var trustProxyDefaultSymbol = '@@symbol:trust_proxy_default';

// Initialize the app
app.init = function init() {
  // Set up cache, engines, and settings
  this.cache = {};
  this.engines = {};
  this.settings = {};

  // Configure default settings
  this.defaultConfiguration();
};

app.defaultConfiguration = function defaultConfiguration() {
  // Set the environment
  var env = process.env.NODE_ENV || 'development';
  debug('booting in %s mode', env);

  // Default settings
  this.enable('x-powered-by');
  this.set('etag', 'weak');
  this.set('env', env);
  this.set('query parser', 'extended');
  this.set('subdomain offset', 2);
  this.set('trust proxy', false);

  // Set trust proxy inherit back-compat
  Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
    configurable: true,
    value: true
  });

  // Mount event handler
  this.on('mount', function onmount(parent) {
    // Inherit trust proxy
    if (this.settings[trustProxyDefaultSymbol] === true && typeof parent.settings['trust proxy fn'] === 'function') {
      delete this.settings['trust proxy'];
      delete this.settings['trust proxy fn'];
    }

    // Inherit protos
    setPrototypeOf(this.request, parent.request);
    setPrototypeOf(this.response, parent.response);
    setPrototypeOf(this.engines, parent.engines);
    setPrototypeOf(this.settings, parent.settings);
  });

  // Set up locals
  this.locals = Object.create(null);
  this.mountpath = '/';

  // Default locals
  this.locals.settings = this.settings;

  // Default configuration
  this.set('view', View);
  this.set('views', resolve('views'));
  this.set('jsonp callback name', 'callback');

  // Enable view cache in production
  if (env === 'production') {
    this.enable('view cache');
  }
}

// Define app object
var app = exports = module.exports = {};

// Define router property
Object.defineProperty(app, 'router', {
  get: function() {
    throw new Error('\'app.router\' is deprecated!\nPlease see the 3.x to 4.x migration guide for details on how to update your app.');
  }
});

// Define lazyrouter function
app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });
    this._router.use(query(this.get('query parser fn')));
    this._router.use(middleware.init(this));
  }
};

// Define handle function
app.handle = function handle(req, res, callback) {
  var router = this._router;

  // Final handler
  var done = callback || finalhandler(req, res, {
    env: this.get('env'),
    onerror: logerror.bind(this)
  });

  // No routes
  if (!router) {
    debug('no routes defined on app');
    done();
    return;
  }

  router.handle(req, res, done);
};

// Define use function
app.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // Default path to '/'
  // Disambiguate app.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // First arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice.call(arguments, offset));

  if (fns.length === 0) {
    throw new TypeError('app.use() requires a middleware function')
  }

  // Setup router
  this.lazyrouter();
  var router = this._router;

  fns.forEach(function (fn) {
    // Non-express app
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // Restore .app property on req and res
    router.use(path, function mounted_app(req, res, next) {
      var orig = req.app;
      fn.handle(req, res, function (err) {
        setPrototypeOf(req, orig.request)
        setPrototypeOf(res, orig.response)
        next(err);
      });
    });

    // Mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
};

// Define route function
app.route = function route(path) {
  this.lazyrouter();
  return this._router.route(path);
};

// Define engine function
app.engine = function engine(ext, fn) {
  if (typeof fn !== 'function') {
    throw new Error('callback function required');
  }

  // Get file extension
  var extension = ext[0] !== '.'
    ? '.' + ext
    : ext;

  // Store engine
  this.engines[extension] = fn;

  return this;
};

// Define param function
app.param = function param(name, fn) {
  this.lazyrouter();

  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; i++) {
      this.param(name[i], fn);
    }
    return this;
  }

  this._router.param(name, fn);

  return this;
};

// Define set function
app.set = function set(setting, val) {
  if (arguments.length === 1) {
    // app.get(setting)
    var settings = this.settings;

    while (settings && settings !== Object.prototype) {
      if (hasOwnProperty.call(settings, setting)) {
        return settings[setting];
      }
      settings = Object.getPrototypeOf(settings);
    }

    return undefined;
  }

  debug('set "%s" to %o', setting, val);

  // Set value
  this.settings[setting] = val;

  // Trigger matched settings
  switch (setting) {
    case 'etag':
      this.set('etag fn', compileETag(val));
      break;
    case 'query parser':
      this.set('query parser fn', compileQueryParser(val));
      break;
    case 'trust proxy':
      this.set('trust proxy fn', compileTrust(val));

      // Trust proxy inherit back-compat
      Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
        configurable: true,
        value: false
      });
      break;
  }

  return this;
};
// Define path function
app.path = function path() {
  return this.parent ? this.parent.path() + this.mountpath : '';
};

// Define enabled function
app.enabled = function enabled(setting) {
  return Boolean(this.set(setting));
};

// Define disabled function
app.disabled = function disabled(setting) {
  return !this.set(setting);
};

// Define enable function
app.enable = function enable(setting) {
  return this.set(setting, true);
};

// Define disable function
app.disable = function disable(setting) {
  return this.set(setting, false);
};

// Delegate `.VERB(...)` calls to `router.VERB(...)`
methods.forEach(function(method) {
  app[method] = function(path) {
    if (method === 'get' && arguments.length === 1) {
      // app.get(setting)
      return this.set(path);
    }

    this.lazyrouter();

    var route = this._router.route(path);
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});

// Define all function
app.all = function all(path) {
  this.lazyrouter();

  var route = this._router.route(path);
  var args = slice.call(arguments, 1);

  for (var i = 0; i < methods.length; i++) {
    route[methods[i]].apply(route, args);
  }

  return this;
};
// Define del function
app.del = deprecate.function(app.delete, 'app.del: Use app.delete instead');

// Define render function
app.render = function render(name, options, callback) {
  var cache = this.cache;
  var done = callback;
  var engines = this.engines;
  var opts = options;
  var renderOptions = {};
  var view;

  // Support callback function as second arg
  if (typeof options === 'function') {
    done = options;
    opts = {};
  }

  // Merge app.locals
  merge(renderOptions, this.locals);

  // Merge options._locals
  if (opts._locals) {
    merge(renderOptions, opts._locals);
  }

  // Merge options
  merge(renderOptions, opts);

  // Set .cache unless explicitly provided
  if (renderOptions.cache == null) {
    renderOptions.cache = this.enabled('view cache');
  }

  // Primed cache
  if (renderOptions.cache) {
    view = cache[name];
  }

  // View
  if (!view) {
    var View = this.get('view');

    view = new View(name, {
      defaultEngine: this.get('view engine'),
      root: this.get('views'),
      engines: engines
    });

    if (!view.path) {
      var dirs = Array.isArray(view.root) && view.root.length > 1
        ? 'directories "' + view.root.slice(0, -1).join('", "') + '" or "' + view.root[view.root.length - 1] + '"'
        : 'directory "' + view.root + '"';
      var err = new Error('Failed to lookup view "' + name + '" in views ' + dirs);
      err.view = view;
      return done(err);
    }

    // Prime the cache
    if (renderOptions.cache) {
      cache[name] = view;
    }
  }

  // Render
  tryRender(view, renderOptions, done);
};
// Define listen function
app.listen = function listen() {
  var server = http.createServer(this);
  // return server.listen.apply(server, arguments);
};

// Log error using console.error
function logerror(err) {
  /* istanbul ignore next */
  if (this.get('env') !== 'test') {
    console.error(err.stack || err.toString());
  }
}

// Try rendering a view
function tryRender(view, options, callback) {
  try {
    view.render(options, callback);
  } catch (err) {
    callback(err);
  }
}
