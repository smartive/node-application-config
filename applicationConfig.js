var path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    helpers = require('./helpers'),
    redirectPattern = /[$][{](.*)[}]/;

function iterate(object, func){
    _.forOwn(object, function(value, key){
        if(_.isPlainObject(value)){
            return iterate(value, func);
        }
        object[key] = func(value);
    });
}

function redirectVariable(value){
    if(!redirectPattern.test(value)) return value;
    var matches = value.match(redirectPattern),
        varName = matches[matches.length-1];
    return process.env[varName] || varName;
}

function Config(options) {
    var self = this;

    this.startupPath = options.startupPath;

    function loadConfig() {
        if (options.enableStateVariables) {
            self.nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
            self.isDebug = self.nodeEnv !== 'production';
        }

        var config = require(path.join(self.startupPath, options.configName));
        _.merge(self, config);

        //redirect vars
        iterate(self, redirectVariable);

        //overwrite config with config.local.json
        var localConfigPath = path.join(self.startupPath, options.localConfigName);
        if (fs.existsSync(localConfigPath)) {
            var localConfig = require(localConfigPath);
            _.merge(self, localConfig);
        }

        //overwrite config with set environment variables (config_...)
        var envConfig = {};
        _.forOwn(process.env, function(value, key){
            if (key.indexOf(options.environmentPrefix) !== 0) return;

            var varPath = key.replace(options.environmentPrefix, '').split('_');
            var selectedObject = envConfig;
            for (var x = 0; x < varPath.length; x++) {
                if (x !== (varPath.length - 1)) {
                    if (!selectedObject[varPath[x]]) selectedObject[varPath[x]] = {};
                    selectedObject = selectedObject[varPath[x]];
                } else {
                    if (helpers.isNumeric(value)) {
                        selectedObject[varPath[x]] = parseFloat(value);
                    } else if (helpers.isBoolean(value)) {
                        selectedObject[varPath[x]] = helpers.toBoolean(value);
                    } else if (value.indexOf('|') !== -1) {
                        selectedObject[varPath[x]] = _.filter(value.split('|'));
                    } else {
                        selectedObject[varPath[x]] = value;
                    }
                }
            }
        });
        _.merge(self, envConfig);
    }

    Object.defineProperty(this, 'reload', {
        value: loadConfig
    });

    this.reload();
}

exports = module.exports = Config;