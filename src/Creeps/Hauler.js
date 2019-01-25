const STATE_IDLE = 0
const STATE_MOVE_TO_PATH = 1
const STATE_HAUL = 2

let HaulerActions =
  {
    Idle: (creep) => {
      Memory.strategy.idleCreeps.push(creep.name)
    },

    MoveToPath: (creep) => {
      if (creep.fatigue <= 0) {
        if (creep.IsAtPathDestination()) {
          creep.memory.state = STATE_HAUL
          creep.memory.pickingUp = true
          creep.StartWalkByPath(Memory.intel[creep.room.name].sourcePaths[creep.memory.sourceIndex])
        } else {
          creep.MoveByPath()
        }
      }
    },

    Haul: (creep) => {
      if (creep.fatigue <= 0) {
        let path = creep.memory.path
        if (creep.memory.pickingUp) {
          let pathPos = path[path.length - 2]
          if (creep.pos.x === pathPos[0] && creep.pos.y === pathPos[1]) {
            creep.memory.pickingUp = false
            let containerPos = path[path.length - 1]
            let container = creep.room.lookForAt(LOOK_STRUCTURES, containerPos[0], containerPos[1])[0]
            if (container) {
              creep.withdraw(container, RESOURCE_ENERGY)
            }
          }
        } else {
          let pathPos = path[1]
          if (creep.pos.x === pathPos[0] && creep.pos.y === pathPos[1]) {
            creep.memory.pickingUp = true
            let containerPos = path[0]
            let container = creep.room.lookForAt(LOOK_STRUCTURES, containerPos[0], containerPos[1])[0]
            if (container) {
              creep.transfer(container, RESOURCE_ENERGY)
            }
          }
        }
        creep.MoveByPath(creep.memory.pickingUp)
      }
    }
  }

let Actions = [
  HaulerActions.Idle,
  HaulerActions.MoveToPath,
  HaulerActions.Haul
]

let Hauler =
  {
    Setup: (creep) => {
      creep.memory.state = STATE_IDLE
    },

    Advance: (creep) => {
      Actions[creep.memory.state](creep)
    },

    SetDepositJob: (creep, sourceIndex) => {
      creep.memory.state = STATE_MOVE_TO_PATH
      creep.memory.sourceIndex = sourceIndex
      creep.StartWalkByPath(Memory.intel[creep.room.name].spawnerToExtensionsPath)
    }
  }

module.exports = Hauler
