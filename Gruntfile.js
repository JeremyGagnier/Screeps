const secrets = require('./secrets.json')

module.exports = (Grunt) => {
  require('load-grunt-tasks')(Grunt)

  Grunt.loadNpmTasks('grunt-contrib-clean')
  Grunt.loadNpmTasks('grunt-contrib-uglify')
  Grunt.loadNpmTasks('grunt-screeps')
  Grunt.loadNpmTasks('grunt-standard')
  Grunt.initConfig({
    babel: {
      options: {
        sourceMap: false,
        presets: ['env']
      },
      deploy: {
        files: [{
          expand: true,
          rename: (dest, src) => dest + src.replace('/', '.'),
          cwd: 'src',
          src: ['**/*.js'],
          dest: 'dist/es5/'
        }]
      },
      stage: {
        files: [{
          expand: true,
          rename: (dest, src) => dest + src.replace('/', '.'),
          cwd: 'src',
          src: ['**/*.js'],
          dest: 'dist/exe/'
        }]
      }
    },
    clean: {
      contents: ['dist/*']
    },
    screeps: {
      deploy: {
        options: {
          email: secrets.email,
          password: secrets.password,
          branch: 'production',
          ptr: false
        },
        src: ['dist/exe/*.js']
      },
      stage: {
        options: {
          email: secrets.email,
          password: secrets.password,
          branch: 'staging',
          ptr: false
        },
        src: ['dist/exe/*.js']
      }
    },
    standard: {
      options: {
        globals: [
          'BOTTOM',
          'BOTTOM_LEFT',
          'BOTTOM_RIGHT',
          'CARRY',
          'CREEP_BUILDER',
          'CREEP_HAULER',
          'CREEP_INITIAL',
          'CREEP_MINER',
          'CREEP_REFILLER',
          'CleanCreeps',
          'Creep',
          'DIRECTIONS',
          'FIND_FLAGS',
          'FIND_MY_SPAWNS',
          'FIND_SOURCES',
          'Game',
          'LEFT',
          'LOOK_CONSTRUCTION_SITES',
          'LOOK_SOURCES',
          'LOOK_STRUCTURES',
          'LOOK_TERRAIN',
          'MOVE',
          'Memory',
          'OK',
          'PathFinder',
          'RESOURCE_ENERGY',
          'RIGHT',
          'ROOM_SIZE',
          'RoomPosition',
          'STRUCTURE_CONTAINER',
          'STRUCTURE_EXTENSION',
          'STRUCTURE_ROAD',
          'Structure',
          'StructureContainer',
          'StructureExtension',
          'StructureSpawn',
          'TOP',
          'TOP_LEFT',
          'TOP_RIGHT',
          'WORK',
          '_'
        ],
        fix: true
      },
      app: {
        src: [
          'src/*.js',
          'src/**/*.js',
          'src/**/**/*.js'
        ]
      }
    },
    uglify: {
      mangle: {},
      compress: {},
      my_target: {
        files: [{
          expand: true,
          cwd: 'dist/es5',
          src: ['**/*.js'],
          dest: 'dist/exe/'
        }]
      }
    }
  })

  Grunt.registerTask('deploy', ['clean', 'standard', 'babel:deploy', 'uglify', 'screeps:deploy'])
  Grunt.registerTask('stage', ['clean', 'standard', 'babel:stage', 'screeps:stage'])
}
