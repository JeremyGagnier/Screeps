const PathManager = require("PathManager");
const SpawnManager = require("SpawnManager");
const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 5s purpose is to construct a filler for the extensions and one miner and hauler for each source.
 */
let Stage5;
Stage5 =
{
    Initialize: () =>
    {
        let room = Game.rooms[Memory.strategy.roomName];
        let roomIntel = Memory.intel[Memory.strategy.roomName];
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

        // Clear dead or idle creeps from jobs and collect lists of jobs.
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

        let maxHarvestJobs = 0;
        let initialHarvestJobs = [];
        for (let sourcePosIter in roomIntel.sourcePositions)
        {
            if (roomIntel.haulers[sourcePosIter] !== null)
            {
                continue;
            }
            let harvestPositions = roomIntel.harvestPositions[sourcePosIter];
            maxHarvestJobs += harvestPositions.length;
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
                initialHarvestJobs.push({sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter});
            }
        }

        let stillIdleCreeps = [];
        let maybeCreep = StrategyUtil.GetNextIdleCreep();
        let jobIndex;
        while (maybeCreep)
        {
            switch (maybeCreep.memory.type)
            {
                case CREEP_INITIAL:
                    if (maybeCreep.IsEmpty())
                    {
                        stillIdleCreeps.push(maybeCreep);
                    }
                    else
                    {
                        if (spawner.IsFull())
                        {
                            let containerPos = roomIntel.extensionsPos;
                            let container = room.lookForAt(LOOK_STRUCTURES, containerPos.x, containerPos.y)[0];
                            if (container.IsFull())
                            {
                                let controllerPos = room.controller.pos;
                                maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3);
                            }
                            else
                            {
                                maybeCreep.SetDepositJob(containerPos.x + ROOM_SIZE * containerPos.y);
                            }
                        }
                        else
                        {
                            maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y);
                        }
                    }
                    break;

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
            }
            maybeCreep = StrategyUtil.GetNextIdleCreep();
        }

        // Before spawning initial creeps we want to try and spawn higher tier creeps
        // First try and spawn a refiller
        if (roomIntel.refiller === null)
        {
            if (spawner.energy >= 300)
            {
                spawner.spawnCreep(
                    [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE],
                    Memory.strategy.creepCount.toString(),
                    {
                        memory: {new: true, type: CREEP_REFILLER},
                        directions: SpawnManager.GetSpawnDirection(roomIntel.spawnerPos)
                    });
            }
        }
        // Spawn hauler before harvester
        else if (haulJobs.length === harvestJobs.length)
        {
            // Minus 4 because the two endpoints are containers.
            let roundTripTicks = roomIntel.sourcePaths[haulJobs[0]].length * 2 - 4;
            // Cap at 7 because it will need 4 move and the max cost is 550.
            let carrySize = Math.max(roundTripTicks / 5 + 1, 7);
            // Defined so that the hauler can move one square per tick.
            let moveSize = carrySize / 2 + carrySize % 2;
            let body = [];
            // Put the final move and carry at the end since it's more efficient.
            for (let i = 1; i < carrySize; ++i)
            {
                body.push(CARRY);
            }
            for (let i = 1; i < moveSize; ++i)
            {
                body.push(MOVE);
            }
            body.push(CARRY);
            body.push(MOVE);
            if (spawner.energy >= (carrySize + moveSize) * 50)
            {
                spawner.spawnCreep(
                    body,
                    Memory.strategy.creepCount.toString(),
                    {
                        memory: {new: true, type: CREEP_HAULER},
                        directions: SpawnManager.GetSpawnDirection(roomIntel.spawnerPos)
                    });
            }
        }
        else
        {
            if (spawner.energy >= 550)
            {
                spawner.spawnCreep(
                    [WORK, WORK, WORK, WORK, WORK, MOVE],
                    Memory.strategy.creepCount.toString(),
                    {
                        memory: {new: true, type: CREEP_MINER},
                        directions: SpawnManager.GetSpawnDirection(roomIntel.spawnerPos)
                    });
            }
        }

        let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, initialHarvestJobs, stillIdleCreeps);
        let creepsCount = Object.keys(Game.creeps).length;
        StrategyUtil.MaybeSpawnInitialCreep(
            shouldSpawnCreep && creepsCount < maxHarvestJobs,
            creepsCount,
            spawner);
    },

    FromStage4ToStage5: () =>
    {
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        let shouldTransition = roomIntel.finishedContainers.length >= roomIntel.harvestPositions.length;
        if (shouldTransition)
        {
            Stage5.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage5;
