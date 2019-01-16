const STATE_IDLE = 0
const STATE_MOVE_TO_PATH = 1
const STATE_MOVE_TO_SOURCE = 2
const STATE_MINE = 3

let MinerActions =
  {
    Idle: (creep) => {
      Memory.strategy.idleCreeps.push(creep.name)
    },

    MoveToPath: (creep) => {
      if (creep.fatigue <= 0) {
        if (creep.memory.walkIndex >= creep.memory.path.length) {
          creep.memory.state = STATE_IDLE
        } else {
          creep.MoveByPath()
        }
      }
    },

    MoveToSource: (creep) => {
      if (creep.fatigue <= 0) {
        if (creep.memory.walkIndex >= creep.memory.path.length) {
          creep.memory.state = STATE_MINE
        } else {
          creep.MoveByPath()
        }
      }
    },

    Mine: (creep) => {
      let pos = creep.memory.harvestPos
      let source = creep.room.lookForAt(LOOK_SOURCES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE))[0]
      if (source) {
        creep.harvest(source)
      } else {
        console.log("Miner didn't end up next to a source")
      }
    }
  }

let Actions = [
  MinerActions.Idle,
  MinerActions.MoveToPath,
  MinerActions.MoveToSource,
  MinerActions.Mine
]

let Miner =
  {
    Setup: (creep) => {
      creep.memory.state = STATE_MOVE_TO_PATH
      creep.memory.walkIndex = 0
      creep.memory.path = Memory.intel[creep.room.name].spawnerToExtensionsPath
    },

    Advance: (creep) => {
      Actions[creep.memory.state](creep)
    },

    SetHarvestJob: (creep, harvestPos, sourceIndex) => {
      creep.memory.state = STATE_MOVE_TO_SOURCE
      creep.memory.walkIndex = 1
      creep.memory.path = Memory.intel[creep.room.name].sourcePaths[sourceIndex]
      creep.memory.harvestPos = harvestPos
    }
  }

module.exports = Miner
