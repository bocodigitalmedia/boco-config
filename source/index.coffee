class Dependencies

  constructor: (props) ->
    @[key] = val for own key, val of props

    @$DEFAULT_NODE_ENV ?= 'develop'
    @$Error ?= Error unless typeof Error is 'undefined'
    @$parseJson ?= JSON.parse unless typeof JSON is 'undefined'
    @$argv ?= if typeof process is undefined then [] else process.argv
    @$env ?= if typeof process is undefined then {} else process.env

    if typeof require is 'function'
      @$asyncEachSeries ?= require('async').eachSeries
      @$readFile ?= require('fs').readFile
      @$parseArgv ?= require('minimist')

configure = (dependencies) ->
  {
    $DEFAULT_NODE_ENV
    $Error
    $asyncEachSeries
    $readFile
    $parseArgv
    $parseJson
    $env
    $argv
  } = dependencies = new Dependencies(dependencies)

  class ConfigException extends $Error
    payload: null

    constructor: (payload) ->
      @name = @constructor.name
      @message = @getMessage payload
      @payload = payload

      if typeof $Error.captureStackTrace is 'function'
        $Error.captureStackTrace @, @constructor

    getMessage: (payload) ->
      null

  class ValueNotSet extends ConfigException
    getMessage: ({envKey, key} = {}) ->
      "Value not set: '#{envKey}.#{key}'"

  class ParameterRequired extends ConfigException
    getMessage: ({name} = {}) ->
      "Parameter required: '#{name}'"

  class NotImplemented extends ConfigException
    getMessage: ->
      "Not implemented."

  class Configuration
    @coerce: (value) ->
      if value instanceof @ then value else new @ value

    overrides: null
    shared: null
    environments: null

    constructor: (props) ->
      @[key] = val for own key, val of props

      @overrides ?= {}
      @shared ?= {}
      @environments ?= {}

    setValues: ({overrides, shared, environments} = {}) ->
      @setOverridesValues overrides
      @setSharedValues shared
      @setEnvironmentsValues environments

    setOverridesValues: (values) ->
      @overrides[key] = val for own key, val of values

    setSharedValues: (values) ->
      @shared[key] = val for own key, val of values

    setEnvironmentValues: (envKey, values) ->
      (@environments[envKey] ?= {})[key] = val for own key, val of values

    setEnvironmentsValues: (environments) ->
      @setEnvironmentValues key, val for own key, val of environments

    get: (envKey, key) ->
      throw ParameterRequired name: 'envKey' unless envKey?
      throw ParameterRequired name: 'key' unless key?

      value = @transformValue envKey, key,
        @getOverrideValue(key) ?
        @getEnvironmentValue(envKey, key) ?
        @getSharedValue(key) ?
        @getDefaultValue(envKey, key)

      @onValueNotSet(envKey, key) unless value?
      value

    getOverrideValue: (key) ->
      @overrides[key]

    getSharedValue: (key) ->
      @shared[key]

    getEnvironmentValue: (envKey, key) ->
      @environments[envKey]?[key]

    getDefaultValue: (envKey, key) ->
      null

    transformValue: (envKey, key, val) ->
      val

    onValueNotSet: (envKey, key) ->
      throw new ValueNotSet {envKey, key}

    createEnvironment: (key) ->
      configuration = @
      new Environment {key, configuration}

  class Environment
    key: null
    configuration: null

    constructor: (props) ->
      @[key] = val for own key, val of props

    get: (key) ->
      @configuration.get @key, key

  class Loader
    @coerce: (value) ->
      if value instanceof @ then value else new @ value

    sources: null

    constructor: (props) ->
      @[key] = val for own key, val of props
      @sources ?= []

    use: (sources...) ->
      @sources = @sources.concat sources

    load: (configuration, done) ->
      throw new ParameterRequired name: 'configuration' unless configuration?
      throw new ParameterRequired name: 'callback' unless done?

      populateConfig = (source, done) ->
        source.getValues (error, values) ->
          return done error if error?

          try
            configuration.setValues values
          catch error
          finally
            return done error if error?
            return done()

      $asyncEachSeries @sources, populateConfig, (error) ->
        return done error if error?
        return done null, configuration

    loadEnvironment: (key, configuration, done) ->
      throw new ParameterRequired name: 'configuration' unless configuration?
      throw new ParameterRequired name: 'key' unless key?
      throw new ParameterRequired name: 'callback' unless done?

      @load configuration, (error) ->
        return done error if error?
        return done null, configuration.createEnvironment(key)

  class Source
    constructor: (props) ->
      @[key] = val for own key, val of props

    getValues: (done) ->
      done new NotImplemented

  class FileSource extends Source
    path: null

    parseContent: (content, done) ->
      done new NotImplemented

    getValues: (done) ->
      $readFile @path, (error, content) =>
        return done error if error?
        @parseContent content, done

  class JsonFileSource extends FileSource

    parseContent: (content, done) ->
      try
        values = $parseJson content
      catch error
      finally
        return done error if error?
        return done null, values

  class EnvSource extends Source
    env: null

    constructor: (props) ->
      super props
      @env ?= $env

    getValues: (done) ->
      done null, overrides: @env

  class ArgvSource extends Source
    argv: null
    options: null

    constructor: (props) ->
      super props
      @argv ?= $argv

    parseArgv: ->
      $parseArgv @argv, @options

    getValues: (done) ->
      try
        overrides = @parseArgv @argv, @options
      catch error
      finally
        return done error if error?
        return done null, {overrides}

  class ObjectSource extends Source
    values: null
    getValues: (done) ->
      done null, @values

  loadEnvironment = (options..., done) ->
    throw new ParameterRequired name: 'callback' unless done?

    {configuration, loader, sources, key} = options[0] ? {}

    configuration = Configuration.coerce configuration
    loader = Loader.coerce loader

    sources ?= [new EnvSource, new ArgvSource]
    key ?= $env.NODE_ENV ? $DEFAULT_NODE_ENV

    loader.use sources...
    loader.loadEnvironment key, configuration, done

  {
    configure
    dependencies
    Dependencies
    ConfigException
    ValueNotSet
    ParameterRequired
    NotImplemented
    Configuration
    Environment
    Loader
    Source
    FileSource
    JsonFileSource
    EnvSource
    ArgvSource
    ObjectSource
    loadEnvironment
  }

module.exports = configure()
