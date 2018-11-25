const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 3s purpose is to build the first container. This container is the slowest to construct and will be used as a
 * trash as well as a storage for extensions.
 */
let Stage3;
Stage3 =
{
    Initialize: () =>
    {
        let room = Game.rooms[Memory.strategy.roomName];
        let extensionsPos = Memory.intel[room.name].extensionsPos;
        room.createConstructionSite(extensionsPos.x, extensionsPos.y, STRUCTURE_CONTAINER);

        let harvestPositions = Memory.intel[room.name].harvestPositions;
        for (let posIter in harvestPositions)
        {
            let pos = harvestPositions[posIter][0];
            room.createConstructionSite(pos % ROOM_SIZE, ~~(pos / ROOM_SIZE), STRUCTURE_CONTAINER);
        }
    },

    Advance: () =>
    {
        let roomName = Memory.strategy.roomName
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
        let harvestJobs = StrategyUtil.GetHarvestJobs(roomIntel);
        let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0];

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
                    let maybeConstruction = room.lookForAt(
                        LOOK_CONSTRUCTION_SITES,
                        roomIntel.extensionsPos.x,
                        roomIntel.extensionsPos.y)[0];

                    if (maybeConstruction)
                    {
                        maybeCreep.SetBuildJob(maybeConstruction.pos.x + ROOM_SIZE * maybeConstruction.pos.y);
                    }
                    else
                    {
                        let maybeContainer = room.lookForAt(
                            LOOK_STRUCTURES,
                            roomIntel.extensionsPos.x,
                            roomIntel.extensionsPos.y)[0];
                        if (maybeContainer)
                        {
                            roomIntel.finishedContainers = [];
                            let controllerPos = room.controller.pos;
                            maybeCreep.SetDepositJob(controllerPos.x + ROOM_SIZE * controllerPos.y, 3);
                        }
                        else
                        {
                            stillIdleCreeps.push(maybeCreep);
                        }
                    }
                }
                else
                {
                    maybeCreep.SetDepositJob(spawner.pos.x + ROOM_SIZE * spawner.pos.y);
                }
            }
            maybeCreep = StrategyUtil.GetNextIdleCreep();
        }
       
        let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, harvestJobs, stillIdleCreeps);
        let creepsCount = Object.keys(Game.creeps).length;
        StrategyUtil.MaybeSpawnInitialCreep(
            shouldSpawnCreep && creepsCount,
            creepsCount,
            spawner);
    },

    FromStage2ToStage3: () =>
    {
        let shouldTransition = Memory.intel[Memory.strategy.roomName].builtExtensionsIndex >= 5;
        if (shouldTransition)
        {
            Stage3.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage3;
