var Config = require('./applicationConfig');

exports = module.exports = function (options) {
    options = options || {};

    options.startupPath = options.startupPath || process.cwd();
    options.configName = options.configName || 'config.json';
    options.localConfigName = options.localConfigName || 'config.local.json';
    options.environmentPrefix = options.environmentPrefix || 'app_config_';

    return new Config(options);
};