let StrategyUtil =
  {
    GetNextIdleCreep: () => {
      while (true) {
        if (Memory.strategy.idleCreeps.length > 0) {
          let idleCreepName = Memory.strategy.idleCreeps.pop()
          let idleCreep = Game.creeps[idleCreepName]
          if (idleCreep) {
            return idleCreep
          }
        } else {
          return null
        }
      }
    },

    GetHarvestJobs: (roomIntel) => {
      let harvestJobs = []
      for (let sourcePosIter in roomIntel.sourcePositions) {
        let harvestPositions = roomIntel.harvestPositions[sourcePosIter]
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
          harvestJobs.push({ sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter })
        }
      }
      return harvestJobs
    },

    AssignHarvestJobs: (roomIntel, harvestJobs, idleCreeps) => {
      for (let jobIter in harvestJobs) {
        if (idleCreeps.length <= 0) {
          return true
        }
        let creep = idleCreeps.pop()
        let job = harvestJobs[jobIter]
        let sourcePosIndex = job.sourcePosIter
        let harvestPosIndex = job.harvestPosIter
        creep.SetHarvestJob(
        roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
        roomIntel.sourcePositions[sourcePosIndex])
        roomIntel.initialHarvesters[sourcePosIndex][harvestPosIndex] = creep.name
      }
      return false
    },

    MaybeSpawnInitialCreep: (shouldSpawn, creepsCount, spawner) => {
      let spawnBig = (creepsCount >= 2 && spawner.energy >= 300)
      let spawnSmall = (creepsCount < 2 && spawner.energy >= 200)
      if (shouldSpawn && (spawnBig || spawnSmall)) {
        let body = []
        if (spawnBig) {
          body = [WORK, CARRY, WORK, MOVE]
        } else {
          body = [CARRY, WORK, MOVE]
        }
        spawner.spawnCreep(
        body,
        Memory.strategy.creepCount.toString(),
        { memory: { new: true, type: CREEP_INITIAL } })
      }
    },

    GetHaulerBody: (pathLength, maxCost) => {
    // Minus 4 because the two endpoints are containers.
      let roundTripTicks = pathLength * 2 - 4
    // Floor divide max cost by 75 since each carry needs at least half a move.
      let carrySize = Math.min(~~(roundTripTicks / 5) + 1, ~~(maxCost / 75))
      let moveSize = ~~(carrySize / 2) + carrySize % 2
      let body = []
    // Put the final move and carry at the end since it's more efficient.
      for (let i = 1; i < carrySize; ++i) {
        body.push(CARRY)
      }
      for (let i = 1; i < moveSize; ++i) {
        body.push(MOVE)
      }
      body.push(CARRY)
      body.push(MOVE)

      return body
    },

    SetNumBuilders: (strategy, numBuilders) => {
      if (numBuilders < strategy.builders.length) {
        let extensionPos = strategy.extensionsPos
        let diePos = extensionPos.x + ROOM_SIZE * extensionPos.y
        while (numBuilders > strategy.builders.length) {
          Game.creeps[strategy.builders.pop()].SetDieJob(diePos)
        }
      } else {
        while (numBuilders > strategy.builders.length) {
          strategy.builders.push(null)
        }
      }
    }
  }

module.exports = StrategyUtil
