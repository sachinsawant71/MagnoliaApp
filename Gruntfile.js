module.exports = function(grunt) {

    // Load tasks
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-ng-constant');

    grunt.initConfig({

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['server/tests/**/*.js']
            }
        },

        env : {
            options : {
                //Shared Options Hash
            },
            dev : {
                NODE_ENV : 'development'
            },
            test : {
                NODE_ENV : 'test'
            }
        },

        nodemon: {
            dev: {
                script: 'server.js'
            }
        },

	    ngconstant: {
			options: {
			  name: 'config',
			  dest: 'config.js',
			  constants: {
				package: grunt.file.readJSON('package.json')
			  },
			  values: {
				debug: true
			  }
			},
			build: {
			}
		}

    });

    grunt.registerTask('serverTests', ['env:test', 'mochaTest']);
    grunt.registerTask('test', ['env:test', 'serverTests']);
    grunt.registerTask('dev', ['env:dev', 'nodemon']);

};