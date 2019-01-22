const StrategyUtil = require('Strategy.StrategyUtil')

/**
 * Stage 4s purpose is to build one container for each source. Since the most efficient miner has no carry this is
 * necessary to collect its harvest.
 */
let Stage4 =
  {
    Advance: () => {
      let roomName = Memory.strategy.roomName
      let roomIntel = Memory.intel[roomName]
      let room = Game.rooms[roomName]
      let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0]

      let harvestJobs = []
      for (let sourcePosIter in roomIntel.sourcePositions) {
        let harvestPositions = roomIntel.harvestPositions[sourcePosIter]
        for (let harvestPosIter in harvestPositions) {
          let harvesterName = roomIntel.initialHarvesters[sourcePosIter][harvestPosIter]
          if (harvesterName) {
            let harvester = Game.creeps[harvesterName]
            if (!harvester ||
                        !harvester.memory.buildSourceIndex ||
                        harvester.memory.buildSourceIndex !== sourcePosIter ||
                        harvester.memory.buildHarvestIndex !== harvestPosIter) {
              roomIntel.initialHarvesters[sourcePosIter][harvestPosIter] = null
            } else {
              continue
            }
          }
        // No harvester OR harvester is dead OR harvester is holding position from previous state
          harvestJobs.push({ sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter })
        }
      }

      let stillIdleCreeps = []
      let maybeCreep = StrategyUtil.GetNextIdleCreep()
      while (maybeCreep) {
        if (maybeCreep.IsEmpty()) {
          stillIdleCreeps.push(maybeCreep)
        } else {
          if (spawner.IsFull()) {
            let containerPosition = null
            if (maybeCreep.memory.buildSourceIndex &&
                        !roomIntel.finishedContainers.includes(
                          roomIntel.harvestPositions[maybeCreep.memory.buildSourceIndex][0])) {
              containerPosition = roomIntel.harvestPositions[maybeCreep.memory.buildSourceIndex][0]
            } else {
              for (let harvestPositionIter in roomIntel.harvestPositions) {
                let pos = roomIntel.harvestPositions[harvestPositionIter][0]
                if (!roomIntel.finishedContainers.includes(pos)) {
                  containerPosition = pos
                  break
                }
              }
            }
            let maybeContainer = room.lookForAt(
            LOOK_CONSTRUCTION_SITES,
            containerPosition % ROOM_SIZE,
            ~~(containerPosition / ROOM_SIZE))[0]

            if (maybeContainer) {
              maybeCreep.SetBuildJob(maybeContainer.pos.x + ROOM_SIZE * maybeContainer.pos.y)
            } else if (containerPosition !== null) {
              roomIntel.finishedContainers.push(containerPosition)
              let controllerPos = room.controller.pos
              maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3)
            }
          } else {
            maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y)
          }
        }
        maybeCreep = StrategyUtil.GetNextIdleCreep()
      }

      let oldIdleCreeps = stillIdleCreeps
      stillIdleCreeps = []
      for (let creepIter in oldIdleCreeps) {
        let creep = oldIdleCreeps[creepIter]
        if (creep.memory.buildSourceIndex) {
          let sourcePosIndex = creep.memory.buildSourceIndex
          let harvestPosIndex = creep.memory.buildHarvestIndex
          creep.SetHarvestJob(
          roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
          roomIntel.sourcePositions[sourcePosIndex])
          roomIntel.initialHarvesters[sourcePosIndex][harvestPosIndex] = creep.name
        } else {
          stillIdleCreeps.push(creep)
        }
      }

      let shouldSpawnCreep = false
      for (let jobIter in harvestJobs) {
        if (stillIdleCreeps.length <= 0) {
          shouldSpawnCreep = true
          break
        }
        let creep = stillIdleCreeps.pop()
        let job = harvestJobs[jobIter]
        let sourcePosIndex = job.sourcePosIter
        let harvestPosIndex = job.harvestPosIter
        creep.SetHarvestJob(
        roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
        roomIntel.sourcePositions[sourcePosIndex])
        roomIntel.initialHarvesters[sourcePosIndex][harvestPosIndex] = creep.name

        creep.memory.buildSourceIndex = sourcePosIndex
        creep.memory.buildHarvestIndex = harvestPosIndex
      }

      if (stillIdleCreeps.length > 0) {
        let extensionPos = roomIntel.extensionsPos
        let diePos = extensionPos.x + ROOM_SIZE * extensionPos.y
        stillIdleCreeps.map(creep => creep.SetDieJob(diePos))
      }

      let creepsCount = Object.keys(Game.creeps).length
      StrategyUtil.MaybeSpawnInitialCreep(
        shouldSpawnCreep,
        creepsCount,
        spawner)
    },

    FromStage3ToStage4: () => {
      return Memory.intel[Memory.strategy.roomName].finishedContainers !== null
    }
  }

module.exports = Stage4
