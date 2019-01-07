const PathManager = require("PathManager");
const SpawnManager = require("SpawnManager");
const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 6s purpose is to convert the rooms energy into control points as efficiently as possible.
 */
let Stage6;
Stage6 =
{
    Initialize: () =>
    {
        let room = Game.rooms[Memory.strategy.roomName];
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        StrategyUtil.SetNumBuilders(roomIntel, roomIntel.sourcePositions.length);
        PathManager.PlaceRoads(room, roomIntel.spawnerToExtensionsPath);
        for (let pathIter in roomIntel.sourcePaths)
        {
            PathManager.PlaceRoads(room, roomIntel.sourcePaths[pathIter]);
        }
    },

    Advance: () =>
    {
        let roomName = Memory.strategy.roomName;
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
        let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0];

        if (roomIntel.refiller !== null)
        {
            if (!Game.creeps[roomIntel.refiller])
            {
                roomIntel.refiller = null;
            }
        }

        let harvestJobs = [];
        let haulJobs = [];
        for (let i in roomIntel.haulers)
        {
            let harvesterName = roomIntel.harvesters[i];
            if (harvesterName !== null)
            {
                if (!Game.creeps[harvesterName])
                {
                    roomIntel.harvesters[i] = null;
                    harvestJobs.push(i);
                }
            }
            else
            {
                    harvestJobs.push(i);
            }

            let haulerName = roomIntel.haulers[i];
            if (haulerName !== null)
            {
                if (!Game.creeps[haulerName])
                {
                    roomIntel.haulers[i] = null;
                    haulJobs.push(i);
                }
            }
            else
            {
                haulJobs.push(i);
            }
        }

        let builderJobs = [];
        for (let i in roomIntel.builders)
        {
            let builderName = roomIntel.builders[i];
            if (builderName !== null)
            {
                if (!Game.creeps[builderName] || Game.creeps[builderName].memory.state === 0)
                {
                    roomIntel.builders[i] = null;
                    builderJobs.push(i);
                }
            }
            else
            {
                builderJobs.push(i);
            }
        }

        let jobIndex;
        let maybeCreep = StrategyUtil.GetNextIdleCreep();
        while (maybeCreep)
        {
            switch (maybeCreep.memory.type)
            {
                case CREEP_MINER:
                    jobIndex = harvestJobs.pop();
                    roomIntel.harvesters[jobIndex] = maybeCreep.name;
                    maybeCreep.SetHarvestJob(roomIntel.sourcePositions[jobIndex], jobIndex);
                    break;

                case CREEP_HAULER:
                    jobIndex = haulJobs.pop();
                    roomIntel.haulers[jobIndex] = maybeCreep.name;
                    maybeCreep.SetDepositJob(jobIndex);
                    break;

                case CREEP_BUILDER:
                    jobIndex = builderJobs.pop();
                    roomIntel.builders[jobIndex] = maybeCreep.name;
                    // TODO: Builders will need to be assigned road building, road maintenance, and controller
                    //       upgrading jobs.
                    break;
            }
            maybeCreep = StrategyUtil.GetNextIdleCreep();
        }

        if (roomIntel.refiller === null)
        {
            spawner.TrySpawn([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], CREEP_REFILLER);
        }
        else if (haulJobs.length === harvestJobs.length && haulJobs.length !== 0)
        {
            spawner.TrySpawn(StrategyUtil.GetHaulerBody(roomIntel.sourcePaths[haulJobs[0]].length, 550), CREEP_HAULER);
        }
        else if (harvestJobs.length !== 0)
        {
            spawner.TrySpawn([WORK, WORK, WORK, WORK, WORK, MOVE], CREEP_MINER);
        }
        else if (builderJobs.length !== 0)
        {
            spawner.TrySpawn([WORK, CARRY, CARRY, CARRY, MOVE, WORK, CARRY, MOVE], CREEP_BUILDER);
        }
    },

    FromStage5ToStage6: () =>
    {
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        let shouldTransition = roomIntel.refiller !== null &&
            !roomIntel.haulers.find((x) => x === null) &&
            !roomIntel.harvesters.find((x) => x === null);
        if (shouldTransition)
        {
            Stage6.Initialize();
        }
        return shouldTransition;
    }
}
