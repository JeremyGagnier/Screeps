const Intel = require('Intel')
const Strategy = require('Strategy.Strategy')

global.ResetMemory = () => {
  let creepCount = Memory.strategy.creepCount
  delete Memory.intel
  delete Memory.strategy
  delete Memory.rooms
  Intel.Initialize()
  Strategy.Initialize()
  Memory.strategy.creepCount = creepCount
  for (let creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName]
    } else {
      Memory.creeps[creepName] = { type: Memory.creeps[creepName].type, new: true }
      Memory.strategy.idleCreeps.push(creepName)
    }
  }
}

global.CleanCreeps = () => {
  for (let creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName]
    }
  }
}
