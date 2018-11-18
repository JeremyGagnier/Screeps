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

        let spawner = room.lookForAt(
            LOOK_STRUCTURES,
            roomIntel.spawnerPos % ROOM_SIZE,
            ~~(roomIntel.spawnerPos / ROOM_SIZE))[0];

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
                        !harvester.memory.buildSourceIndex ||
                        harvester.memory.buildSourceIndex != sourcePosIter ||
                        harvester.memory.buildHarvestIndex != harvestPosIter)
                    {
                        roomIntel.harvesters[sourcePosIter][harvestPosIter] = null;
                    }
                    else
                    {
                        continue;
                    }
                }
                // No harvester OR harvester is dead OR harvester is holding position from previous state
                harvestJobs.push({sourcePosIter: sourcePosIter, harvestPosIter: harvestPosIter});
            }
        }

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
                        if (maybeCreep.memory.buildSourceIndex &&
                            !Memory.strategy.finishedContainers.includes(
                                roomIntel.harvestPositions[maybeCreep.memory.buildSourceIndex][0]))
                        {
                            containerPosition = roomIntel.harvestPositions[maybeCreep.memory.buildSourceIndex][0];
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

        let oldIdleCreeps = stillIdleCreeps;
        stillIdleCreeps = [];
        for (let creepIter in oldIdleCreeps)
        {
            let creep = oldIdleCreeps[creepIter];
            if (creep.memory.buildSourceIndex)
            {
                let sourcePosIndex = creep.memory.buildSourceIndex;
                let harvestPosIndex = creep.memory.buildHarvestIndex;
                creep.SetHarvestJob(
                    roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
                    roomIntel.sourcePositions[sourcePosIndex])
            }
            else
            {
                stillIdleCreeps.push(oldIdleCreeps[creepIter])
            }
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
            let sourcePosIndex = job.sourcePosIter;
            let harvestPosIndex = job.harvestPosIter;
            creep.SetHarvestJob(
                roomIntel.harvestPositions[sourcePosIndex][harvestPosIndex],
                roomIntel.sourcePositions[sourcePosIndex]);
            roomIntel.harvesters[sourcePosIndex][harvestPosIndex] = creep.name;

            creep.memory.buildSourceIndex = sourcePosIndex;
            creep.memory.buildHarvestIndex = harvestPosIndex;
        }

        Memory.strategy.idleCreeps = stillIdleCreeps.map(creep => creep.name);

        let creepsCount = Object.keys(Game.creeps).length;
        StrategyUtil.MaybeSpawnInitialCreep(
            shouldSpawnCreep && creepsCount < Memory.strategy.harvestPositionsCount,
            creepsCount,
            spawner);
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
