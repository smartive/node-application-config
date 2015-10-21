var should = require('should');

describe('Application config package', function () {
    var appConfig = require('../index.js');

    describe('#constructor', function () {
        it('should return object', function () {
            var config = appConfig();
            should.exist(config);
        });

        it('should pass default options', function () {
            var config = appConfig();
            config.startupPath.should.be.equal(process.cwd());
        });

        it('should throw on wrong options', function () {
            should.throws(function () {
                var config = appConfig({
                    startupPath: './'
                });
            });

            should.throws(function () {
                var config = appConfig({
                    configName: 'konfig.js'
                });
            });
        });

        it('should return correct config', function () {
            var config = appConfig({
                localConfigName: 'noop.js'
            });

            config.startupPath.should.be.equal(process.cwd());
            should.exist(config.db);
            should.exist(config.very.nested.config);

            config.db.user.should.equal('test');
            config.db.pass.should.equal('testPass');

            config.very.nested.config.variable.should.equal(true);
        });

        it('should merge config correctly with localconfig', function () {
            var config = appConfig();

            should.exist(config.db);
            should.exist(config.very.nested.config);

            config.db.user.should.equal('test');
            config.db.pass.should.equal('mergePass');

            config.very.nested.config.variable.should.equal(true);
            config.very.nested.config.variableTwo.should.equal(true);
        });

        it('should disable isStage and isDebug', function () {
            var config = appConfig({
                enableStateVariables: false
            });

            should.not.exist(config.nodeEnv);
            should.not.exist(config.isDebug);
            should.not.exist(config.isStage);
            should.not.exist(config.isProduction);
        });

        it('should configure isDebug correctly', function () {
            var config = appConfig();

            config.nodeEnv.should.equal('development');
            config.isDebug.should.equal(true);
        });

        it('should configure isProduction correctly', function () {
            var old = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            var config = appConfig();

            config.nodeEnv.should.equal('production');
            config.isDebug.should.equal(false);

            process.env.NODE_ENV = old;
        });

        describe('environmental variables', function () {
            before(function () {
                process.env.app_config_db_user = 'envUser';
                process.env.app_config_arrayType = 'string1|string2|string3';
            });

            after(function () {
                delete process.env.app_config_db_user;
                delete process.env.app_config_arrayType;
            });

            it('should merge config correctly with environment variables', function () {
                var config = appConfig();

                should.exist(config.db);
                should.exist(config.very.nested.config);

                config.db.user.should.equal('envUser');
                config.db.pass.should.equal('mergePass');

                config.very.nested.config.variable.should.equal(true);
                config.very.nested.config.variableTwo.should.equal(true);
            });

            it('should parse an array correctly', function () {
                var config = appConfig();

                should.exist(config.arrayType);

                config.arrayType
                    .should.be.an.Array()
                    .and.containDeep(['string1', 'string2', 'string3'])
                    .and.have.length(3);
            });
        });

        describe('redirecting variables', function () {
            before(function () {
                process.env.TEST_ENV_VAR = 'setVariable';
            });

            after(function () {
                delete process.env.TEST_ENV_VAR;
            });

            it('should redirect the correct environment variables', function () {
                var config = appConfig();

                should.exist(config.special);
                should.exist(config.special.routes.redirect);

                config.special.routes.redirect.should.equal('setVariable');
            });

            it('should leave the not set variables as they are', function () {
                var config = appConfig();

                should.exist(config.special);
                should.exist(config.special.routes.redirectNot);

                config.special.routes.redirectNot.should.equal('TEST_ENV_VAR_NOT_SET');
            });
        });
    });

    describe('#reload', function () {
        after(function () {
            delete process.env.app_config_db_user;
        });

        it('should reload and merge config correctly', function () {
            var config = appConfig();

            config.db.user.should.equal('test');

            process.env.app_config_db_user = 'envUser';

            config.reload();

            config.db.user.should.equal('envUser');
        });

        it('should reload and merge isDebug correctly', function () {
            var config = appConfig();

            config.isDebug.should.equal(true);

            process.env.NODE_ENV = 'production';

            config.reload();

            config.isDebug.should.equal(false);
        });
    });
});