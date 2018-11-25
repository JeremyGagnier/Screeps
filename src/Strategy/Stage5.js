const PathManager = require("PathManager");
const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 5s purpose is to construct a filler for the extensions and one miner and hauler for each source.
 */
let Stage5;
Stage5 =
{
    Initialize: () =>
    {
        PathManager.PlaceRoads(room, spawnerToExtensionsPath);
        for (let pathIter in sourcePaths)
        {
            PathManager.PlaceRoads(room, sourcePaths[pathIter]);
        }
    },

    Advance: () =>
    {
        let roomName = Memory.strategy.roomName;
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
        let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0];

        // Clear dead or idle creeps from jobs and collect lists of jobs.
        if (roomIntel.refiller !== null)
        {
            if (!Game.creeps[roomIntel.refiller])
            {
                roomIntel.refiller = null;
            }
        }

        let numHarvesters = 0;
        let numHaulers = 0;
        for (let i in roomIntel.haulers)
        {
            let harvesterName = roomIntel.harvesters[i];
            if (harvesterName !== null)
            {
                if (Game.creeps[harvesterName])
                {
                    numHarvesters += 1;
                }
                else
                {
                    roomIntel.harvesters[i] = null;
                }
            }

            let haulerName = roomIntel.haulers[i];
            if (haulerName !== null)
            {
                if (Game.creeps[haulerName])
                {
                    numHaulers += 1;
                }
                else
                {
                    roomIntel.haulers[i] = null;
                }
            }
        }

        let harvestJobs = [];
        for (let sourcePosIter in roomIntel.sourcePositions)
        {
            if (roomIntel.haulers[sourcePosIter] !== null)
            {
                continue;
            }
            let harvestPositions = roomIntel.harvestPositions[sourcePosIter];
            for (let harvestPosIter in harvestPositions)
            {
                let harvesterName = roomIntel.initialHarvesters[sourcePosIter][harvestPosIter];
                if (harvesterName)
                {
                    let harvester = Game.creeps[harvesterName];
                    if (!harvester ||
                        !harvester.memory.sourcePos ||
                        harvester.memory.sourcePos !== roomIntel.sourcePositions[sourcePosIter])
                    {
                        roomIntel.initialHarvesters[sourcePosIter][harvestPosIter] = null;
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

        // Assign full initial creeps to hauling jobs.
        let stillIdleCreeps = [];
        let maybeCreep = StrategyUtil.GetNextIdleCreep();
        while (maybeCreep)
        {
            if (maybeCreep.IsEmpty())
            {
                stillIdleCreeps.push(maybeCreep);
            }
            else
            {
                if (spawner.IsFull())
                {
                    let controllerPos = room.controller.pos;
                    maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3);
                }
                else
                {
                    maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y);
                }
            }
            maybeCreep = StrategyUtil.GetNextIdleCreep();
        }

        // Assign empty initial creeps to harvesting jobs.
        let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, harvestJobs, stillIdleCreeps);
    },

    FromStage4ToStage5: () =>
    {
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        let shouldTransition = roomIntel.finishedContainers.length === roomIntel.harvestPositions.length;
        if (shouldTransition)
        {
            Stage5.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage5;
