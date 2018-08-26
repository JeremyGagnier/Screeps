const secrets = require("./secrets.json");

module.exports = (Grunt) =>
{
    require("load-grunt-tasks")(Grunt);
    
    Grunt.loadNpmTasks('grunt-contrib-clean');
    Grunt.loadNpmTasks("grunt-contrib-uglify");
    Grunt.loadNpmTasks("grunt-screeps");
    Grunt.initConfig(
    {
        babel:
        {
            options:
            {
                sourceMap: false,
                presets: ["env"]
            },
            dist:
            {
                files:
                [
                    {
                        expand: true,
                        cwd: "src",
                        src: ["**/*.js"],
                        dest: "dist/es5/"
                    }
                ]
            }
        },
        clean:
        {
            contents: ["dist/*"]
        },
        screeps:
        {
            options:
            {
                email: secrets.email,
                password: secrets.password,
                branch: "default",
                ptr: false
            },
            dist:
            {
                src: ["dist/uglify/*.js"]
            }
        },
        uglify:
        {
            mangle: {},
            compress: {},
            my_target:
            {
                files:
                [
                    {
                        expand: true,
                        cwd: "dist/es5",
                        src: ["**/*.js"],
                        dest: "dist/uglify/"
                    }
                ]
            }
        }
    });

    Grunt.registerTask("upload", ["clean", "babel", "uglify", "screeps"])
}
