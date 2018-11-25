const ExtensionManager = require("ExtensionManager");
const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 2s purpose is to build five extensions. This is exactly enough to build an ideal miner. However such a miner
 * won't be constructed until the initial containers are built.
 */
let Stage2;
Stage2 =
{
    Initialize: () =>
    {
        let roomName = Memory.strategy.roomName;
        ExtensionManager.PlaceExtensions(Game.rooms[roomName], 0, 5, Memory.intel[roomName].extensionsPos);
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
                    let extensionPos = ExtensionManager.GetTransformedPosition(
                        roomIntel.builtExtensionsIndex,
                        roomIntel.extensionsPos);
                    let maybeExtension = room.lookForAt(LOOK_CONSTRUCTION_SITES, extensionPos[0], extensionPos[1])[0];
                    if (maybeExtension)
                    {
                        maybeCreep.SetBuildJob(maybeExtension.pos.x + ROOM_SIZE * maybeExtension.pos.y);
                    }
                    else
                    {
                        roomIntel.builtExtensionsIndex += 1;
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

        let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, harvestJobs, stillIdleCreeps);
        let creepsCount = Object.keys(Game.creeps).length;
        StrategyUtil.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawner);
    },

    FromStage1ToStage2: () =>
    {
        let shouldTransition = Game.rooms[Memory.strategy.roomName].controller.level >= 2;
        if (shouldTransition)
        {
            Stage2.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage2;
