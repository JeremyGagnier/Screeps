const StrategyUtil = require("Strategy.StrategyUtil");

let Stage3;
Stage3 =
{
    Initialize: () =>
    {
        let room = Game.rooms[Memory.strategy.roomName];
        let extensionsPos = Memory.intel[room.name].extensionsPos;
        room.createConstructionSite(extensionsPos.x, extensionsPos.y, STRUCTURE_CONTAINER);

        let harvestPositions = Memory.intel[room.name].harvestPositions;
        let harvestPositionsCount = 0;
        for (let posIter in harvestPositions)
        {
            harvestPositionsCount += harvestPositions[posIter].length;
            let pos = harvestPositions[posIter][0];
            room.createConstructionSite(pos % ROOM_SIZE, ~~(pos / ROOM_SIZE), STRUCTURE_CONTAINER);
        }
        Memory.strategy.finishedContainers = null;
        Memory.strategy.harvestPositionsCount = harvestPositionsCount;
    },

    Advance: () =>
    {
        let roomName = Memory.strategy.roomName
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
        let harvestJobs = StrategyUtil.GetHarvestJobs(roomName);

        let spawner = room.lookForAt(
            LOOK_STRUCTURES,
            roomIntel.spawnerPos % ROOM_SIZE,
            ~~(roomIntel.spawnerPos / ROOM_SIZE))[0];

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
                    let containerPosition;
                    let maybeContainer;
                    if (Memory.strategy.finishedContainers === null)
                    {
                        maybeContainer = room.lookForAt(
                            LOOK_CONSTRUCTION_SITES,
                            roomIntel.extensionsPos.x,
                            roomIntel.extensionsPos.y)[0];
                    }
                    else
                    {
                        if (maybeCreep.memory.buildPosition &&
                            !Memory.strategy.finishedContainers.includes(
                                roomIntel.harvestPositions[maybeCreep.memory.buildPosition][0]))
                        {
                            containerPosition = roomIntel.harvestPositions[maybeCreep.memory.buildPosition][0];
                        }
                        else
                        {
                            for (let harvestPositionIter in roomIntel.harvestPositions)
                            {
                                let pos = roomIntel.harvestPositions[harvestPositionIter][0]
                                if (!Memory.strategy.finishedContainers.includes(pos))
                                {
                                    containerPosition = pos;
                                    break;
                                }
                            }
                        }
                        maybeContainer = room.lookForAt(
                            LOOK_CONSTRUCTION_SITES,
                            containerPosition % ROOM_SIZE,
                            ~~(containerPosition / ROOM_SIZE))[0];
                    }
                    if (maybeContainer)
                    {
                        maybeCreep.SetBuildJob(maybeContainer.pos.x + ROOM_SIZE * maybeContainer.pos.y);
                    }
                    else
                    {
                        if (Memory.strategy.finishedContainers === null)
                        {
                            Memory.strategy.finishedContainers = [];
                        }
                        else
                        {
                            Memory.strategy.finishedContainers.push(containerPosition);
                        }
                        let controllerPos = room.controller.pos;
                        maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3);
                    }
                }
                else
                {
                    maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y);
                }
            }
            maybeCreep = StrategyUtil.GetNextIdleCreep();
        }

        let shouldSpawnCreep = false;
        for (let jobIter in harvestJobs)
        {
            if (stillIdleCreeps.length <= 0)
            {
                shouldSpawnCreep = true;
                break;
            }
            let creep = stillIdleCreeps.pop();
            let job = harvestJobs[jobIter];
            creep.SetHarvestJob(
                roomIntel.harvestPositions[job.sourcePosIter][job.harvestPosIter],
                roomIntel.sourcePositions[job.sourcePosIter]);
            creep.memory.buildPosition = job.sourcePosIter;
            roomIntel.harvesters[job.sourcePosIter][job.harvestPosIter] = creep.name;
        }

        Memory.strategy.idleCreeps = stillIdleCreeps.map(creep => creep.name);

        let creepsCount = Object.keys(Game.creeps).length;
        if (shouldSpawnCreep && creepsCount < Memory.strategy.harvestPositionsCount)
        {
            let has300 = spawner.energy >= 300;
            if (creepsCount >= 2 || has300)
            {
                if (has300)
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

    FromStage2ToStage3: () =>
    {
        let shouldTransition = Memory.strategy.builtExtensionsIndex >= 5;
        if (shouldTransition)
        {
            Stage3.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage3;
