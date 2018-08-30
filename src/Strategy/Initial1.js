let Initial1 =
{
    Advance: () =>
    {
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        let prioritizedJobs = [];
        let shouldSpawnCreep = false;
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
                // Using while loop to keep popping idle creeps if they're dead.
                while (true)
                {
                    if (Memory.strategy.idleCreeps.length > 0)
                    {
                        let idleCreepName = Memory.strategy.idleCreeps.pop();
                        let idleCreep = Game.creeps[idleCreepName];
                        if (idleCreep)
                        {
                            idleCreep.SetHarvestJob(
                                harvestPositions[harvestPosIter],
                                roomIntel.sourcePositions[sourcePosIter],
                                roomIntel.spawnerPos);
                            roomIntel.harvesters[sourcePosIter][harvestPosIter] = idleCreepName;
                            break;
                        }
                    }
                    else
                    {
                        shouldSpawnCreep = true;
                        break;
                    }
                }
            }
        }

        if (shouldSpawnCreep)
        {
            let spawner = Game.rooms[Memory.strategy.roomName].lookForAt(
                LOOK_STRUCTURES,
                roomIntel.spawnerPos % ROOM_SIZE,
                ~~(roomIntel.spawnerPos / ROOM_SIZE))[0];
            
            if (Object.keys(Game.creeps).length >= 2)
            {
                if (spawner.energy >= 300)
                {
                    spawner.spawnCreep([WORK, WORK, CARRY, MOVE], Game.time.toString(), {memory: {new: true, type: 0}});
                }
            }
            else if (spawner.energy >= 200)
            {
                spawner.spawnCreep([WORK, CARRY, MOVE], Game.time.toString(), {memory: {new: true, type: 0}});
            }
        }
    },

    FromInitial1ToInitial2: () =>
    {
        return false;//Game.rooms[Memory.strategy.roomName].controller.level >= 2;
    }
};

module.exports = Initial1;
