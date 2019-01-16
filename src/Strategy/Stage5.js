const StrategyUtil = require('Strategy.StrategyUtil')

/**
 * Stage 5s purpose is to construct a filler for the extensions and one miner and hauler for each source.
 */
let Stage5 =
  {
    Advance: () => {
      let roomName = Memory.strategy.roomName
      let roomIntel = Memory.intel[roomName]
      let room = Game.rooms[roomName]
      let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0]

    // Clear dead or idle creeps from jobs and collect lists of jobs.
      if (roomIntel.refiller !== null) {
        if (!Game.creeps[roomIntel.refiller]) {
          roomIntel.refiller = null
        }
      }

      let harvestJobs = []
      let haulJobs = []
      for (let i in roomIntel.haulers) {
        let harvesterName = roomIntel.harvesters[i]
        if (harvesterName !== null) {
          if (!Game.creeps[harvesterName]) {
            roomIntel.harvesters[i] = null
            harvestJobs.push(i)
          }
        } else {
          harvestJobs.push(i)
        }

        let haulerName = roomIntel.haulers[i]
        if (haulerName !== null) {
          if (!Game.creeps[haulerName]) {
            roomIntel.haulers[i] = null
            haulJobs.push(i)
          }
        } else {
          haulJobs.push(i)
        }
      }

      let maxHarvestJobs = 0
      let initialHarvestJobs = []
      for (let sourcePosIter in roomIntel.sourcePositions) {
        if (roomIntel.harvesters[sourcePosIter] !== null) {
          continue
        }
        let harvestPositions = roomIntel.harvestPositions[sourcePosIter]
        maxHarvestJobs += harvestPositions.length
        for (let harvestPosIter in harvestPositions) {
          let harvesterName = roomIntel.initialHarvesters[sourcePosIter][harvestPosIter]
          if (harvesterName) {
            let harvester = Game.creeps[harvesterName]
            if (!harvester ||
                        !harvester.memory.sourcePos ||
                        harvester.memory.sourcePos !== roomIntel.sourcePositions[sourcePosIter]) {
              roomIntel.initialHarvesters[sourcePosIter][harvestPosIter] = null
            } else {
              continue
            }
          }
        // No harvester OR harvester is dead OR harvester has finished harvesting.
          initialHarvestJobs.push({ sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter })
        }
      }

      let stillIdleCreeps = []
      let maybeCreep = StrategyUtil.GetNextIdleCreep()
      let jobIndex
      while (maybeCreep) {
        switch (maybeCreep.memory.type) {
          case CREEP_INITIAL:
            if (maybeCreep.IsEmpty()) {
              stillIdleCreeps.push(maybeCreep)
            } else {
              if (spawner.IsFull()) {
                let containerPos = roomIntel.extensionsPos
                let container = room.lookForAt(LOOK_STRUCTURES, containerPos.x, containerPos.y)[0]
                if (container.IsFull()) {
                  let controllerPos = room.controller.pos
                  maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3)
                } else {
                  maybeCreep.SetDepositJob(containerPos.x + ROOM_SIZE * containerPos.y)
                }
              } else {
                maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y)
              }
            }
            break

          case CREEP_MINER:
            jobIndex = harvestJobs.pop()
            roomIntel.harvesters[jobIndex] = maybeCreep.name
            maybeCreep.SetHarvestJob(roomIntel.sourcePositions[jobIndex], jobIndex)
            break

          case CREEP_HAULER:
            jobIndex = haulJobs.pop()
            roomIntel.haulers[jobIndex] = maybeCreep.name
            maybeCreep.SetDepositJob(jobIndex)
            break
        }
        maybeCreep = StrategyUtil.GetNextIdleCreep()
      }

      // Before spawning initial creeps we want to try and spawn higher tier creeps
      // First try and spawn a refiller
      if (roomIntel.refiller === null) {
        spawner.TrySpawn([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], CREEP_REFILLER)
      } else if (haulJobs.length === harvestJobs.length && haulJobs.length !== 0) {
        // Spawn hauler before harvester
        spawner.TrySpawn(StrategyUtil.GetHaulerBody(roomIntel.sourcePaths[haulJobs[0]].length, 550), CREEP_HAULER)
      } else if (harvestJobs.length !== 0) {
        spawner.TrySpawn([WORK, WORK, WORK, WORK, WORK, MOVE], CREEP_MINER)
      }

      let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, initialHarvestJobs, stillIdleCreeps)

      if (stillIdleCreeps.length > 0) {
        let extensionPos = roomIntel.extensionsPos
        let diePos = extensionPos.x + ROOM_SIZE * extensionPos.y
        stillIdleCreeps.map(creep => creep.SetDieJob(diePos))
      }

      let creepsCount = Object.keys(Game.creeps).length
      StrategyUtil.MaybeSpawnInitialCreep(
      shouldSpawnCreep && creepsCount < maxHarvestJobs,
      creepsCount,
      spawner)
    },

    FromStage4ToStage5: () => {
      let roomIntel = Memory.intel[Memory.strategy.roomName]
      return roomIntel.finishedContainers.length >= roomIntel.harvestPositions.length
    }
  }

module.exports = Stage5
