# node-application-config
Package to provide application config with local config and environment support.
This package allows you to simply override config variables by defining local config files or environment variables.

Also `nodeEnv`, and `isDebug` are set based on `NODE_ENV`, which can be used in your code later on.

##### A bunch of badges

[![Build Status](https://travis-ci.org/smartive/node-application-config.svg?maxAge=3600)](https://travis-ci.org/smartive/node-application-config) [![npm](https://img.shields.io/npm/v/node-application-config.svg?maxAge=3600)](https://www.npmjs.com/package/node-application-config) [![Coverage status](https://img.shields.io/coveralls/smartive/node-application-config.svg?maxAge=3600)](https://coveralls.io/github/smartive/node-application-config) [![license](https://img.shields.io/github/license/smartive/node-application-config.svg?maxAge=2592000)](https://github.com/smartive/node-application-config)

## Features

### Parse environment variables

If you want to parse other environmental variables into your application config, and you 
cannot (or you don't wanna) use `process.env` you can use the parsing feature.
If you declare a config variable with the following pattern: `${ENV_VAR_NAME}`, 
the config application will match it to the corresponding environment variable.

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

### Require json file

If you need to require a `json` - yes only json, 'cause securty - file, you can do that
with a special pattern. You need to use a relative filepath. If any error happens
during the require process, the variable will have the value `REQUIRE_ERROR` and
will have the error message attached. 

The pattern for this feature is: `!{filepath.json}`.

#### Example

`foobar.json`
```json
{
  "hello": "world" 
}
```

`config.json`
```json
{
  "foobar": "!{./foobar.json}"
}
```

Results in:

```json
{
  "foobar": {
    "hello": "world"
  }
}
```

### Parse environment array variables

If you want to overwrite an array with a config variable (maybe you have a list of languages), 
you can overwrite the array with the following syntax:

`ARRAY_ENV=str1|str2|str3`

This feature is only necessary if you want to overwrite an array with environment variables, 
since you can use arrays in the `config.json` and the `config.local.json` files. 
If you want to overwrite a variable with a single element array or even an empty array, 
you can simply pass `str1|` for a single element array or `|` for an empty array.

#### Example

```bash
export app_config_arrayType=string1|string2|string3
export app_config_emptyArrayType=|
export app_config_singleElementArrayType=string1|
```

Results in:

```json
{
  "arrayType": [
    "string1",
    "string2",
    "string3"
  ],
  "emptyArrayType": [],
  "singleElementArrayType": [
    "string1"
  ]
}
```

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

### envConfigName
Name of the environment configuration (which overwrites the base config, but is not necessarily in the version control)
`ENV` will be replaced with `process.env.NODE_ENV`!

default: `config.ENV.json`

### environmentPrefix
Prefix for environment variables that overwrite the configurations

default: `app_config_`

### environmentDelimiter
Which character is used for splitting the environment variables after the prefix is removed.

default: `_`

### enableStateVariables
Enable the automatically set `nodeEnv`, `isDebug`, `isStage` and `isProduction` config variables, based on `NODE_ENV`.
If no `NODE_ENV` is set, `development` is taken as fallback value.

default: `true`


## Priorities
When merging config variables, the following priorities are taken into account:

1. Environment variable
2. Local config variable
3. Environment config file
4. Config variable


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
