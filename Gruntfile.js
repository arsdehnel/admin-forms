module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        common: {
            src: [
                'js/dev/handlebars.min.js',
                'js/dev/underscore.js',
                'js/dev/handlebarsHelpers.js',
                'js/dev/select2.js',
                'js/dev/jquery.serializeObject.js',
                'js/dev/spin.js',
                'js/dev/autoAdmin.*.js',
                'js/dev/common.js'
            ],
            dest: 'js/common.min.js',
        }
    },
    autoprefixer: {
        options: {
            browsers: ['last 2 version']
        },
        dist: {
            files: [
                {
                    src: 'css/base/main.css',
                    dest: 'css/main.css'
                }
            ]
        },
    },
    sass: {
        dev: {
            options: {
                style: 'expanded'
            },
            files: {
                'css/base/main.css': 'scss/main.scss'
            }
        },
        dist: {
            options: {
                style: 'compressed'
            },
            files: {
                'css/base/main.css': 'scss/main.scss'
            }
        }
    },
    watch: {
        js: {
            files: ['js/dev/*.js','Gruntfile.js'],
            tasks: ['scripts']
        },
        scss: {
            files: ['scss/*.scss'],
            tasks: ['css']
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-autoprefixer');

  //by default (ie dev environment) we want to:
  // - compile handlebars
  // - concat js
  // - compile scss expanded
  grunt.registerTask('default', ['concat','sass:dev','autoprefixer']);

  //if we changed a scss file we can just do:
  // - compile scss expanded
  grunt.registerTask('css', ['sass:dev','autoprefixer']);

  //if we change a script file we can just do these ( we could break them out but seems like overkill ):
  // - compile handlebars
  // - concat js
  grunt.registerTask('scripts', ['concat']);

  //for the build command that we will run manually when we're all done we do some different things:
  // - compile handlebars
  // - uglify js
  // - compile css compressed
  // - build all that into a .zip for delivery
  grunt.registerTask('dist', ['concat','sass:dist','compress']);

};