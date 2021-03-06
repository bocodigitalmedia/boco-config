// Generated by CoffeeScript 1.11.1
var Dependencies, configure,
  hasProp = {}.hasOwnProperty,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  slice = [].slice;

Dependencies = (function() {
  function Dependencies(props) {
    var key, val;
    for (key in props) {
      if (!hasProp.call(props, key)) continue;
      val = props[key];
      this[key] = val;
    }
    if (this.$DEFAULT_NODE_ENV == null) {
      this.$DEFAULT_NODE_ENV = 'develop';
    }
    if (typeof Error !== 'undefined') {
      if (this.$Error == null) {
        this.$Error = Error;
      }
    }
    if (typeof JSON !== 'undefined') {
      if (this.$parseJson == null) {
        this.$parseJson = JSON.parse;
      }
    }
    if (this.$argv == null) {
      this.$argv = typeof process === void 0 ? [] : process.argv;
    }
    if (this.$env == null) {
      this.$env = typeof process === void 0 ? {} : process.env;
    }
    if (typeof require === 'function') {
      if (this.$asyncEachSeries == null) {
        this.$asyncEachSeries = require('async').eachSeries;
      }
      if (this.$readFile == null) {
        this.$readFile = require('fs').readFile;
      }
      if (this.$parseArgv == null) {
        this.$parseArgv = require('minimist');
      }
    }
  }

  return Dependencies;

})();

configure = function(dependencies) {
  var $DEFAULT_NODE_ENV, $Error, $argv, $asyncEachSeries, $env, $parseArgv, $parseJson, $readFile, ArgvSource, ConfigException, Configuration, EnvSource, Environment, FileSource, JsonFileSource, Loader, NotImplemented, ObjectSource, ParameterRequired, Source, ValueNotSet, loadEnvironment, ref;
  ref = dependencies = new Dependencies(dependencies), $DEFAULT_NODE_ENV = ref.$DEFAULT_NODE_ENV, $Error = ref.$Error, $asyncEachSeries = ref.$asyncEachSeries, $readFile = ref.$readFile, $parseArgv = ref.$parseArgv, $parseJson = ref.$parseJson, $env = ref.$env, $argv = ref.$argv;
  ConfigException = (function(superClass) {
    extend(ConfigException, superClass);

    ConfigException.prototype.payload = null;

    function ConfigException(payload) {
      this.name = this.constructor.name;
      this.message = this.getMessage(payload);
      this.payload = payload;
      if (typeof $Error.captureStackTrace === 'function') {
        $Error.captureStackTrace(this, this.constructor);
      }
    }

    ConfigException.prototype.getMessage = function(payload) {
      return null;
    };

    return ConfigException;

  })($Error);
  ValueNotSet = (function(superClass) {
    extend(ValueNotSet, superClass);

    function ValueNotSet() {
      return ValueNotSet.__super__.constructor.apply(this, arguments);
    }

    ValueNotSet.prototype.getMessage = function(arg) {
      var envKey, key, ref1;
      ref1 = arg != null ? arg : {}, envKey = ref1.envKey, key = ref1.key;
      return "Value not set: '" + envKey + "." + key + "'";
    };

    return ValueNotSet;

  })(ConfigException);
  ParameterRequired = (function(superClass) {
    extend(ParameterRequired, superClass);

    function ParameterRequired() {
      return ParameterRequired.__super__.constructor.apply(this, arguments);
    }

    ParameterRequired.prototype.getMessage = function(arg) {
      var name;
      name = (arg != null ? arg : {}).name;
      return "Parameter required: '" + name + "'";
    };

    return ParameterRequired;

  })(ConfigException);
  NotImplemented = (function(superClass) {
    extend(NotImplemented, superClass);

    function NotImplemented() {
      return NotImplemented.__super__.constructor.apply(this, arguments);
    }

    NotImplemented.prototype.getMessage = function() {
      return "Not implemented.";
    };

    return NotImplemented;

  })(ConfigException);
  Configuration = (function() {
    Configuration.coerce = function(value) {
      if (value instanceof this) {
        return value;
      } else {
        return new this(value);
      }
    };

    Configuration.prototype.overrides = null;

    Configuration.prototype.shared = null;

    Configuration.prototype.environments = null;

    function Configuration(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
      if (this.overrides == null) {
        this.overrides = {};
      }
      if (this.shared == null) {
        this.shared = {};
      }
      if (this.environments == null) {
        this.environments = {};
      }
    }

    Configuration.prototype.setValues = function(arg) {
      var environments, overrides, ref1, shared;
      ref1 = arg != null ? arg : {}, overrides = ref1.overrides, shared = ref1.shared, environments = ref1.environments;
      this.setOverridesValues(overrides);
      this.setSharedValues(shared);
      return this.setEnvironmentsValues(environments);
    };

    Configuration.prototype.setOverridesValues = function(values) {
      var key, results, val;
      results = [];
      for (key in values) {
        if (!hasProp.call(values, key)) continue;
        val = values[key];
        results.push(this.overrides[key] = val);
      }
      return results;
    };

    Configuration.prototype.setSharedValues = function(values) {
      var key, results, val;
      results = [];
      for (key in values) {
        if (!hasProp.call(values, key)) continue;
        val = values[key];
        results.push(this.shared[key] = val);
      }
      return results;
    };

    Configuration.prototype.setEnvironmentValues = function(envKey, values) {
      var base, key, results, val;
      results = [];
      for (key in values) {
        if (!hasProp.call(values, key)) continue;
        val = values[key];
        results.push(((base = this.environments)[envKey] != null ? base[envKey] : base[envKey] = {})[key] = val);
      }
      return results;
    };

    Configuration.prototype.setEnvironmentsValues = function(environments) {
      var key, results, val;
      results = [];
      for (key in environments) {
        if (!hasProp.call(environments, key)) continue;
        val = environments[key];
        results.push(this.setEnvironmentValues(key, val));
      }
      return results;
    };

    Configuration.prototype.get = function(envKey, key) {
      var ref1, ref2, ref3, value;
      if (envKey == null) {
        throw ParameterRequired({
          name: 'envKey'
        });
      }
      if (key == null) {
        throw ParameterRequired({
          name: 'key'
        });
      }
      value = this.transformValue(envKey, key, (ref1 = (ref2 = (ref3 = this.getOverrideValue(key)) != null ? ref3 : this.getEnvironmentValue(envKey, key)) != null ? ref2 : this.getSharedValue(key)) != null ? ref1 : this.getDefaultValue(envKey, key));
      if (value == null) {
        this.onValueNotSet(envKey, key);
      }
      return value;
    };

    Configuration.prototype.getOverrideValue = function(key) {
      return this.overrides[key];
    };

    Configuration.prototype.getSharedValue = function(key) {
      return this.shared[key];
    };

    Configuration.prototype.getEnvironmentValue = function(envKey, key) {
      var ref1;
      return (ref1 = this.environments[envKey]) != null ? ref1[key] : void 0;
    };

    Configuration.prototype.getDefaultValue = function(envKey, key) {
      return null;
    };

    Configuration.prototype.transformValue = function(envKey, key, val) {
      return val;
    };

    Configuration.prototype.onValueNotSet = function(envKey, key) {
      throw new ValueNotSet({
        envKey: envKey,
        key: key
      });
    };

    Configuration.prototype.createEnvironment = function(key) {
      var configuration;
      configuration = this;
      return new Environment({
        key: key,
        configuration: configuration
      });
    };

    return Configuration;

  })();
  Environment = (function() {
    Environment.prototype.key = null;

    Environment.prototype.configuration = null;

    function Environment(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    Environment.prototype.get = function(key) {
      return this.configuration.get(this.key, key);
    };

    return Environment;

  })();
  Loader = (function() {
    Loader.coerce = function(value) {
      if (value instanceof this) {
        return value;
      } else {
        return new this(value);
      }
    };

    Loader.prototype.sources = null;

    function Loader(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
      if (this.sources == null) {
        this.sources = [];
      }
    }

    Loader.prototype.use = function() {
      var sources;
      sources = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.sources = this.sources.concat(sources);
    };

    Loader.prototype.load = function(configuration, done) {
      var populateConfig;
      if (configuration == null) {
        throw new ParameterRequired({
          name: 'configuration'
        });
      }
      if (done == null) {
        throw new ParameterRequired({
          name: 'callback'
        });
      }
      populateConfig = function(source, done) {
        return source.getValues(function(error, values) {
          if (error != null) {
            return done(error);
          }
          try {
            return configuration.setValues(values);
          } catch (error1) {
            error = error1;
          } finally {
            if (error != null) {
              return done(error);
            }
            return done();
          }
        });
      };
      return $asyncEachSeries(this.sources, populateConfig, function(error) {
        if (error != null) {
          return done(error);
        }
        return done(null, configuration);
      });
    };

    Loader.prototype.loadEnvironment = function(key, configuration, done) {
      if (configuration == null) {
        throw new ParameterRequired({
          name: 'configuration'
        });
      }
      if (key == null) {
        throw new ParameterRequired({
          name: 'key'
        });
      }
      if (done == null) {
        throw new ParameterRequired({
          name: 'callback'
        });
      }
      return this.load(configuration, function(error) {
        if (error != null) {
          return done(error);
        }
        return done(null, configuration.createEnvironment(key));
      });
    };

    return Loader;

  })();
  Source = (function() {
    function Source(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    Source.prototype.getValues = function(done) {
      return done(new NotImplemented);
    };

    return Source;

  })();
  FileSource = (function(superClass) {
    extend(FileSource, superClass);

    function FileSource() {
      return FileSource.__super__.constructor.apply(this, arguments);
    }

    FileSource.prototype.path = null;

    FileSource.prototype.parseContent = function(content, done) {
      return done(new NotImplemented);
    };

    FileSource.prototype.getValues = function(done) {
      return $readFile(this.path, (function(_this) {
        return function(error, content) {
          if (error != null) {
            return done(error);
          }
          return _this.parseContent(content, done);
        };
      })(this));
    };

    return FileSource;

  })(Source);
  JsonFileSource = (function(superClass) {
    extend(JsonFileSource, superClass);

    function JsonFileSource() {
      return JsonFileSource.__super__.constructor.apply(this, arguments);
    }

    JsonFileSource.prototype.parseContent = function(content, done) {
      var error, values;
      try {
        return values = $parseJson(content);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return done(null, values);
      }
    };

    return JsonFileSource;

  })(FileSource);
  EnvSource = (function(superClass) {
    extend(EnvSource, superClass);

    EnvSource.prototype.env = null;

    function EnvSource(props) {
      EnvSource.__super__.constructor.call(this, props);
      if (this.env == null) {
        this.env = $env;
      }
    }

    EnvSource.prototype.getValues = function(done) {
      return done(null, {
        overrides: this.env
      });
    };

    return EnvSource;

  })(Source);
  ArgvSource = (function(superClass) {
    extend(ArgvSource, superClass);

    ArgvSource.prototype.argv = null;

    ArgvSource.prototype.options = null;

    function ArgvSource(props) {
      ArgvSource.__super__.constructor.call(this, props);
      if (this.argv == null) {
        this.argv = $argv;
      }
    }

    ArgvSource.prototype.parseArgv = function() {
      return $parseArgv(this.argv, this.options);
    };

    ArgvSource.prototype.getValues = function(done) {
      var error, overrides;
      try {
        return overrides = this.parseArgv(this.argv, this.options);
      } catch (error1) {
        error = error1;
      } finally {
        if (error != null) {
          return done(error);
        }
        return done(null, {
          overrides: overrides
        });
      }
    };

    return ArgvSource;

  })(Source);
  ObjectSource = (function(superClass) {
    extend(ObjectSource, superClass);

    function ObjectSource() {
      return ObjectSource.__super__.constructor.apply(this, arguments);
    }

    ObjectSource.prototype.values = null;

    ObjectSource.prototype.getValues = function(done) {
      return done(null, this.values);
    };

    return ObjectSource;

  })(Source);
  loadEnvironment = function() {
    var configuration, done, i, key, loader, options, ref1, ref2, ref3, sources;
    options = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), done = arguments[i++];
    if (done == null) {
      throw new ParameterRequired({
        name: 'callback'
      });
    }
    ref2 = (ref1 = options[0]) != null ? ref1 : {}, configuration = ref2.configuration, loader = ref2.loader, sources = ref2.sources, key = ref2.key;
    configuration = Configuration.coerce(configuration);
    loader = Loader.coerce(loader);
    if (sources == null) {
      sources = [new EnvSource, new ArgvSource];
    }
    if (key == null) {
      key = (ref3 = $env.NODE_ENV) != null ? ref3 : $DEFAULT_NODE_ENV;
    }
    loader.use.apply(loader, sources);
    return loader.loadEnvironment(key, configuration, done);
  };
  return {
    configure: configure,
    dependencies: dependencies,
    Dependencies: Dependencies,
    ConfigException: ConfigException,
    ValueNotSet: ValueNotSet,
    ParameterRequired: ParameterRequired,
    NotImplemented: NotImplemented,
    Configuration: Configuration,
    Environment: Environment,
    Loader: Loader,
    Source: Source,
    FileSource: FileSource,
    JsonFileSource: JsonFileSource,
    EnvSource: EnvSource,
    ArgvSource: ArgvSource,
    ObjectSource: ObjectSource,
    loadEnvironment: loadEnvironment
  };
};

module.exports = configure();

//# sourceMappingURL=index.js.map
