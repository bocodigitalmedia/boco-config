# boco-config

App configuration utilities for Node.js

* highly customizable to suit your needs
* use any source (database, file, environment variables, etc)

## Installation

```
npm install boco-config
```

## Usage


```coffee
BocoConfig = require 'boco-config'

# optionally specify how configuration values are treated
configuration = new BocoConfig.Configuration

  getDefaultValue: (envKey, key) ->
    # default behavior is to return null
    return '001' if key is 'FOO'
    null

  transformValue: (envKey, key, value) ->
    # default behavior is to return `value` unchanged
    return parseInt value if key is 'FOO'
    value

  onValueNotSet: (envKey, key) ->
    # default behavior is to throw an error, let's log instead:
    console.log "Missing value: #{envKey}.#{key}"

# optionally specify sources (defaults to env and argv)
# order denotes ascending priority (highest last)
sources = Array \
  new BocoConfig.JsonFileSource(path: './config.json'),
  new BocoConfig.EnvSource(),
  new BocoConfig.ArgvSource()

# load an environment configuration
BocoConfig.loadEnvironment {configuration, sources}, (error, env) ->
  throw error if error?

  console.log env.get('FOO') # => 1
  env.get('BAR') # => Missing value: develop.BAR
```

## Sources

Configuration values must be loaded from one or more sources.

Each source provides a `getValues(done)` function that returns an object with `shared`, `overrides`, and `environments[env]` values.

A call to `get` a configuration value will look first at overrides, then at environments[env], then at shared, and finally call `getDefaultValue` as a last resort.

This makes writing your own custom config source is simple, as the only method you need to implement is `getValues`.

The values are retrieved from each source in order, and are overwritten

### EnvSource

Uses `process.env` as *overrides* configuration values.

### ArgvSource

Parses `process.argv` (using `minimist` by default) and uses the result as *overrides* configuration values.

### JsonFileSource

Loads JSON from `path` and applies *overrides*, *shared*, and *environments* values.

```json
{
  "shared": {
    "FOO": "foo"
  },
  "overrides": {
    "FOO": "foo-override"
  },
  "environments": {
    "develop": {
      "BAR": "bar-develop"
    },
    "staging": {
      "BAR": "bar-staging"
    },
    "production": {
      "BAR": "bar-production"
    }
  }
}
```  

### FileSource

An abstract file source, you can supply `path` and `parseContent(content, done)` as options to parse whatever config file source you would like to use (YAML, etc).

## License

The MIT License (MIT)

Copyright (c) 2016 <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
