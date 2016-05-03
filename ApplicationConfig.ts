import path = require('path');
import fs = require('fs');
import _ = require('lodash');

const REDIRECT_PATTERN = /[$][{](.*)[}]/;
const DEFAULTS: ApplicationConfigOptions = {
    startupPath: process.cwd(),
    configName: 'config.json',
    localConfigName: 'config.local.json',
    envConfigName: 'config.ENV.json',
    environmentPrefix: 'app_config_',
    environmentDelimiter: '_',
    enableStateVariables: true
};

function iterate(object: any, func: Function) {
    _.forOwn(object, (value, key) => {
        if (_.isPlainObject(value)) {
            return iterate(value, func);
        }
        object[key] = func(value);
    });
}

function redirectVariable(value: string): string {
    if (!REDIRECT_PATTERN.test(value)) {
        return value;
    }
    var matches = value.match(REDIRECT_PATTERN),
        varName = matches[matches.length - 1];
    return process.env[varName] || varName;
}

function isNumeric(number: string): boolean {
    return !isNaN(parseFloat(number)) && isFinite(parseFloat(number));
}

function isBoolean(str: string): boolean {
    return (/^true|false$/i).test(str);
}

function toBoolean(str: string): boolean {
    return str === 'true';
}

export interface ApplicationConfigOptions {
    startupPath?: string;
    configName?: string;
    localConfigName?: string;
    envConfigName?: string;
    environmentPrefix?: string;
    environmentDelimiter?: string;
    enableStateVariables?: boolean;
}

export class ApplicationConfig {
    private static options: ApplicationConfigOptions = DEFAULTS;
    private static _config: any;

    public static configure(options: ApplicationConfigOptions) {
        ApplicationConfig.options = _.merge({}, DEFAULTS, options);
    }

    public static get config(): any {
        if (!ApplicationConfig._config) {
            ApplicationConfig.reload();
        }
        return ApplicationConfig._config;
    }

    public static reload(): void {
        let config: any = {};

        config.startupPath = ApplicationConfig.options.startupPath;
        config.nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

        if (ApplicationConfig.options.enableStateVariables) {
            config.isDebug = config.nodeEnv !== 'production';
        }

        let configFile = require(path.join(config.startupPath, ApplicationConfig.options.configName));
        _.merge(config, configFile);

        ApplicationConfig._config = config;
        iterate(config, redirectVariable);

        let envConfigPath = path.join(config.startupPath, ApplicationConfig.options.envConfigName.replace('ENV', config.nodeEnv));

        if (fs.existsSync(envConfigPath)) {
            let envConfig = require(envConfigPath);
            _.merge(config, envConfig);
        }

        let localConfigPath = path.join(config.startupPath, ApplicationConfig.options.localConfigName);
        if (fs.existsSync(localConfigPath)) {
            let localConfig = require(localConfigPath);
            _.merge(config, localConfig);
        }

        let envConfig = {};
        _.forOwn(process.env, (value, key) => {
            if (key.indexOf(ApplicationConfig.options.environmentPrefix) !== 0) {
                return;
            }

            let varPath = key.replace(ApplicationConfig.options.environmentPrefix, '').split(ApplicationConfig.options.environmentDelimiter);
            let selectedObject = envConfig;
            for (let x = 0; x < varPath.length; x++) {
                if (x !== (varPath.length - 1)) {
                    if (!selectedObject[varPath[x]]) {
                        selectedObject[varPath[x]] = {};
                    }
                    selectedObject = selectedObject[varPath[x]];
                } else {
                    if (isNumeric(value)) {
                        selectedObject[varPath[x]] = parseFloat(value);
                    } else if (isBoolean(value)) {
                        selectedObject[varPath[x]] = toBoolean(value);
                    } else if (value.indexOf('|') !== -1) {
                        selectedObject[varPath[x]] = _.filter(value.split('|'));
                    } else {
                        selectedObject[varPath[x]] = value;
                    }
                }
            }
        });

        _.merge(config, envConfig);
        ApplicationConfig._config = config;
    }
}
