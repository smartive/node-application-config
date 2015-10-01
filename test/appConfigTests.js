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
            config.isStage.should.equal(false);
            config.isProduction.should.equal(false);
        });

        it('should configure isStage correctly', function () {
            var old = process.env.NODE_ENV;
            process.env.NODE_ENV = 'staging';

            var config = appConfig();

            config.nodeEnv.should.equal('staging');
            config.isDebug.should.equal(false);
            config.isProduction.should.equal(false);
            config.isStage.should.equal(true);

            process.env.NODE_ENV = old;
        });

        it('should configure isProduction correctly', function () {
            var old = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            var config = appConfig();

            config.nodeEnv.should.equal('production');
            config.isDebug.should.equal(false);
            config.isStage.should.equal(false);
            config.isProduction.should.equal(true);

            process.env.NODE_ENV = old;
        });

        describe('environmental variables', function () {
            before(function () {
                process.env.app_config_db_user = 'envUser';
            });

            after(function () {
                delete process.env.app_config_db_user;
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

        describe('evaluating variables', function () {
            it('should evaluate echo "hello" correctly', function () {
                var config = appConfig();

                should.exist(config.special);
                should.exist(config.special.routes.evaluate);

                config.special.routes.evaluate.should.equal('hello\n');
            });

            it('should add an error message for "noop"', function () {
                var config = appConfig();

                should.exist(config.special);
                should.exist(config.special.routes.evaluateNot);

                config.special.routes.evaluateNot.should.startWith('Error:');
                config.special.routes.evaluateNot.should.match(/.*command not found.*/);
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
    });
});