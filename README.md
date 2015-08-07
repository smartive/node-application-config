# node-application-config
package to provide application config with local config and environment support

## usage

```javascript
var appConfig = require('node-application-config'),
    config = appConfig([options]);
```

## configuration

"options" is a hash with the following config variables:

### startupPath
base path for the application and for the config package to search for configurations

default: process.cwd()

### configName
name of the base configuration

default: 'config.json'

### localConfigName
name of the local configuration (which overwrites the base config, but is not necessarily in the version control)

default: 'config.local.json'

### environmentPrefix
prefix for environment variables that overwrite the configurations

default: 'app_config_'

## example
config.json
```json
{
  "db": {
    "user": "test",
    "pass": "testPass"
  }
}
```
config.local.json
```json
{
  "db": {
      "host": "localhost"
  }
}
```
environment variable
```bash
app_config_db_port=10000
```

results in:
```javascript
var appConfig = require('node-application-config'),
    config = appConfig();
    
config.db.user == "test";
config.db.pass == "testPass";
config.db.host == "localhost";
config.db.port == 10000;
```