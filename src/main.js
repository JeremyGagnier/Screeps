require('Constants')
require('Extends.Creep')
require('Extends.Structure')
require('Extends.StructureContainer')
require('Extends.StructureExtension')
require('Extends.StructureSpawn')
require('Util')

const Intel = require('Intel')
const Strategy = require('Strategy.Strategy')

module.exports.loop = () => {
  if (!Memory.strategy) {
    Intel.Initialize()
    Strategy.Initialize()
  }

  if ((Game.time % 1500) === 0) {
    CleanCreeps()
  }

  Memory.strategy.idleCreeps = []
  for (let creepName in Game.creeps) {
    try {
      let creep = Game.creeps[creepName]
      creep.Advance()
    } catch (error) {
      console.log('Failed to advance creep: ' + creepName, error.stack)
    }
  }

  try {
    Strategy.Advance()
  } catch (error) {
    console.log('Failed to advance strategy', error.stack)
  }
}
