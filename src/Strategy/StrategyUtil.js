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
                break;
            }
        }
    },

    GetHarvestJobs: (roomName) =>
    {
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
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
    }
}


module.exports = StrategyUtil;
