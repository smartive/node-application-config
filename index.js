var Config = require('./applicationConfig'),
    _ = require('lodash'),
    defaults = {
        startupPath: process.cwd(),
        configName: 'config.json',
        localConfigName: 'config.local.json',
        environmentPrefix: 'app_config_',
        enableStateVariables: true
    };

exports = module.exports = function (options) {
    return new Config(_.merge({}, defaults, options));
};