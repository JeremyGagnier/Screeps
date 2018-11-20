const StrategyUtil = require("Strategy.StrategyUtil");

let Stage4;
Stage4 =
{
    Initialize: () =>
    {
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
                        harvester.memory.buildSourceIndex !== sourcePosIter ||
                        harvester.memory.buildHarvestIndex !== harvestPosIter)
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
                    let maybeContainer = room.lookForAt(
                        LOOK_CONSTRUCTION_SITES,
                        containerPosition % ROOM_SIZE,
                        ~~(containerPosition / ROOM_SIZE))[0];

                    if (maybeContainer)
                    {
                        maybeCreep.SetBuildJob(maybeContainer.pos.x + ROOM_SIZE * maybeContainer.pos.y);
                    }
                    else
                    {
                        Memory.strategy.finishedContainers.push(containerPosition);
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
                    roomIntel.sourcePositions[sourcePosIndex]);
                roomIntel.harvesters[sourcePosIndex][harvestPosIndex] = creep.name;
            }
            else
            {
                stillIdleCreeps.push(creep);
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

        let extensionPos = Memory.intel[room.name].extensionsPos;
        let diePos = extensionPos.x + ROOM_SIZE * extensionPos.y;
        Memory.strategy.idleCreeps = [stillIdleCreeps.pop()];
        stillIdleCreeps.map(creep => creep.SetDieJob(diePos));

        let creepsCount = Object.keys(Game.creeps).length;
        StrategyUtil.MaybeSpawnInitialCreep(
            shouldSpawnCreep && creepsCount < Memory.strategy.harvestPositionsCount,
            creepsCount,
            spawner);
    },

    FromStage3ToStage4: () =>
    {
        let shouldTransition = Memory.strategy.finishedContainers !== null;
        if (shouldTransition)
        {
            Stage4.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage4;
