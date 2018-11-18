let StrategyUtil =
{
    GetNextIdleCreep: () =>
    {
        while (true)
        {
            if (Memory.strategy.idleCreeps.length > 0)
            {
                let idleCreepName = Memory.strategy.idleCreeps.pop();
                let idleCreep = Game.creeps[idleCreepName];
                if (idleCreep)
                {
                    return idleCreep;
                }
            }
            else
            {
                return null;
            }
        }
    },

    GetHarvestJobs: (roomIntel) =>
    {
        let harvestJobs = [];
        for (let sourcePosIter in roomIntel.sourcePositions)
        {
            let harvestPositions = roomIntel.harvestPositions[sourcePosIter];
            for (let harvestPosIter in harvestPositions)
            {
                let harvesterName = roomIntel.harvesters[sourcePosIter][harvestPosIter];
                if (harvesterName)
                {
                    let harvester = Game.creeps[harvesterName];
                    if (!harvester ||
                        !harvester.memory.sourcePos ||
                        harvester.memory.sourcePos !== roomIntel.sourcePositions[sourcePosIter])
                    {
                        roomIntel.harvesters[sourcePosIter][harvestPosIter] = null;
                    }
                    else
                    {
                        continue;
                    }
                }
                // No harvester OR harvester is dead OR harvester has finished harvesting.
                harvestJobs.push({sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter});
            }
        }
        return harvestJobs;
    },

    AssignHarvestJobs: (roomIntel, harvestJobs, idleCreeps) =>
    {
        for (let jobIter in harvestJobs)
        {
            if (idleCreeps.length <= 0)
            {
                return true;
            }
            let creep = idleCreeps.pop();
            let job = harvestJobs[jobIter];
            let sourcePosIndex = job.sourcePosIter;
            let harvestPosIndex = job.harvestPosIter;
            creep.SetHarvestJob(
                roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
                roomIntel.sourcePositions[sourcePosIndex]);
            roomIntel.harvesters[sourcePosIndex][harvestPosIndex] = creep.name;
        }
        return false;
    },

    MaybeSpawnInitialCreep: (shouldSpawn, creepsCount, spawner) => {
        let spawnBig = (creepsCount >= 2 && spawner.energy >= 300);
        let spawnSmall = (creepsCount < 2 && spawner.energy >= 200);
        if (shouldSpawn && (spawnBig || spawnSmall))
        {
            let body = []
            if (spawnBig)
            {
                body = [WORK, CARRY, WORK, MOVE]
            }
            else
            {
                body = [CARRY, WORK, MOVE]
            }
            spawner.spawnCreep(
                body,
                Memory.strategy.creepCount.toString(),
                {memory: {new: true, type: CREEP_INITIAL}});
        }
    }
}


module.exports = StrategyUtil;
