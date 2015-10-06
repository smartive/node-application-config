# node-application-config [![Build Status](https://travis-ci.org/buehler/node-application-config.svg?branch=master)](https://travis-ci.org/buehler/node-application-config)
Package to provide application config with local config and environment support.
This package allows you to simply override config variables by defining local config files or environment variables.

Also `nodeEnv`, `isDebug`, `isStage` and `isProduction` are set based on `NODE_ENV`, which can be used in your code later on.

## Features

### Parse environment variables

If you want to parse other environmental variables into your application config, and you cannot (or you don't wanna) use `process.env` you can use the parsing feature.
If you declare a config variable with the following pattern: `${ENV_VAR_NAME}`, the config application will match it to the corresponding environment variable.

#### Example

```bash
export TEST_ENV_VAR=foobar
```

```json
{
  "db": {
    "host": "${TEST_ENV_VAR}"
  }
}
```

In this case, `config.db.host` will be parsed to "foobar".

## Usage

```javascript
var appConfig = require('node-application-config'),
    config = appConfig(options);
```


## Configuration

`options` is a hash with the following config variables:

### startupPath
Base path for the application and for the config package to search for configurations

default: `process.cwd()`

### configName
Name of the base configuration

default: `config.json`

### localConfigName
Name of the local configuration (which overwrites the base config, but is not necessarily in the version control)

default: `config.local.json`

### environmentPrefix
Prefix for environment variables that overwrite the configurations

default: `app_config_`

### enableStateVariables
Enable the automatically set `nodeEnv`, `isDebug`, `isStage` and `isProduction` config variables, based on `NODE_ENV`.
If no `NODE_ENV` is set, `development` is taken as fallback value.

default: `true`


## Priorities
When merging config variables, the following priorities are taken into account:

1. Environment variable
2. Local config variable
3. Config variable


## Example

config.json

```json
{
  "db": {
    "user": "test",
    "pass": "testPass",
    "port": "10000"
  }
}
```

config.local.json

```json
{
  "db": {
      "pass": "securePass",
      "host": "localhost"
  }
}
```
environment variable

```bash
app_config_db_port=1337
```

... results in:

```javascript
var appConfig = require('node-application-config'),
    config = appConfig();

config.db.user == "test";
config.db.pass == "securePass";
config.db.host == "localhost";
config.db.port == 1337;
```
