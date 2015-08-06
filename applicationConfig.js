var path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

function isNumeric(number) {
    return !isNaN(parseFloat(number)) && isFinite(number);
}

function isBoolean(str) {
    return (/^true|false$/i).test(str);
}

function toBoolean(str) {
    return str == 'true';
}

function Config(options) {
    var self = this;

    this.startupPath = options.startupPath;
    this.isDebug = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging';
    this.isStage = process.env.NODE_ENV !== 'staging';

    function loadConfig() {
        var config = require(path.join(self.startupPath, options.configName));
        _.merge(self, config);

        //overwrite config with config.local.json
        var localConfigPath = path.join(self.startupPath, options.localConfigName);
        if (fs.existsSync(localConfigPath)) {
            var localConfig = require(localConfigPath);
            _.merge(self, localConfig);
        }

        //overwrite config with set environment variables (config_...)
        var envConfig = {};
        for (var prop in process.env) {
            if (process.env.hasOwnProperty(prop) && prop.indexOf(options.environmentPrefix) === 0) {
                var varPath = prop.replace(options.environmentPrefix, '').split('_');
                var selectedObject = envConfig;
                for (var x = 0; x < varPath.length; x++) {
                    if (x !== (varPath.length - 1)) {
                        if (!selectedObject[varPath[x]]) selectedObject[varPath[x]] = {};
                        selectedObject = selectedObject[varPath[x]];
                    } else {
                        var value = process.env[prop];
                        if (isNumeric(value)) {
                            selectedObject[varPath[x]] = parseFloat(value);
                        } else if (isBoolean(value)) {
                            selectedObject[varPath[x]] = toBoolean(value);
                        } else {
                            selectedObject[varPath[x]] = process.env[prop];
                        }
                    }
                }
            }
        }
        _.merge(self, envConfig);
    }

    Object.defineProperty(this, 'reload', {
        value: loadConfig
    });

    this.reload();
}

exports = module.exports = Config;