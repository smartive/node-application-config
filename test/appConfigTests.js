var should = require('should');

describe('Application config package', function () {
    var Config = require('../index.js');

    describe('#constructor', function () {
        it('should return object', function () {
            var config = new Config();
            should.exist(config);
        });

        it('should pass default options', function () {
            var config = new Config();
            config.startupPath.should.be.equal(process.cwd());
        });

        it('should throw on wrong options', function () {
            should.throws(function () {
                var config = new Config({
                    startupPath: './'
                });
            });

            should.throws(function () {
                var config = new Config({
                    configName: 'konfig.js'
                });
            });
        });

        it('should return correct config', function () {
            var config = new Config({
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
            var config = new Config();

            should.exist(config.db);
            should.exist(config.very.nested.config);

            config.db.user.should.equal('test');
            config.db.pass.should.equal('mergePass');

            config.very.nested.config.variable.should.equal(true);
            config.very.nested.config.variableTwo.should.equal(true);
        });

        describe('environmental variables', function () {
            before(function () {
                process.env.app_config_db_user = 'envUser';
            });

            after(function () {
                delete process.env.app_config_db_user;
            });

            it('should merge config correctly with environment variables', function () {
                var config = new Config();

                should.exist(config.db);
                should.exist(config.very.nested.config);

                config.db.user.should.equal('envUser');
                config.db.pass.should.equal('mergePass');

                config.very.nested.config.variable.should.equal(true);
                config.very.nested.config.variableTwo.should.equal(true);
            });
        })
    });

    describe('#reload', function () {
        after(function () {
            delete process.env.app_config_db_user;
        });

        it('should reload and merge config correctly', function () {
            var config = new Config();

            config.db.user.should.equal('test');

            process.env.app_config_db_user = 'envUser';

            config.reload();

            config.db.user.should.equal('envUser');
        });
    });
});