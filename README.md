# node-application-config
package to provide application config with local config and environment support

## usage

```javascript
var Config = require('application-config'),
    config = new Config([options]);
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