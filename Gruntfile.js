const secrets = require("./secrets.json");

module.exports = (Grunt) =>
{
    require("load-grunt-tasks")(Grunt);
    
    Grunt.loadNpmTasks('grunt-contrib-clean');
    Grunt.loadNpmTasks("grunt-contrib-uglify");
    Grunt.loadNpmTasks("grunt-screeps");
    Grunt.initConfig({
        babel: {
            options: {
                sourceMap: false,
                presets: ["env"]
            },
            deploy: {
                files: [{
                    expand: true,
                    rename: (dest, src) => dest + src.replace("/", "."),
                    cwd: "src",
                    src: ["**/*.js"],
                    dest: "dist/es5/"
                }]
            },
            stage: {
                files: [{
                    expand: true,
                    rename: (dest, src) => dest + src.replace("/", "."),
                    cwd: "src",
                    src: ["**/*.js"],
                    dest: "dist/exe/"
                }]
            }
        },
        clean: {
            contents: ["dist/*"]
        },
        screeps: {
            deploy: {
                options: {
                    email: secrets.email,
                    password: secrets.password,
                    branch: "production",
                    ptr: false
                },
                src: ["dist/exe/*.js"]
            },
            stage: {
                options: {
                    email: secrets.email,
                    password: secrets.password,
                    branch: "staging",
                    ptr: false
                },
                src: ["dist/exe/*.js"]
            }
        },
        uglify: {
            mangle: {},
            compress: {},
            my_target: {
                files: [{
                    expand: true,
                    cwd: "dist/es5",
                    src: ["**/*.js"],
                    dest: "dist/exe/"
                }]
            }
        }
    });

    Grunt.registerTask("deploy", ["clean", "babel:deploy", "uglify", "screeps:deploy"]);
    Grunt.registerTask("stage", ["clean", "babel:stage", "screeps:stage"]);
}
