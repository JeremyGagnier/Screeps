const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 5s purpose is to construct a filler for the extensions and one miner for each source.
 */
let Stage5;
Stage5 =
{
    Initialize: () =>
    {
        Memory.strategy.refiller = null;
        Memory.strategy.harvesters = [];
        Memory.strategy.haulers = [];
    },

    Advance: () =>
    {
        let roomName = Memory.strategy.roomName;
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

        let shouldSpawnCreep = StrategyUtil.AssignHarvestJobs(roomIntel, harvestJobs, stillIdleCreeps);

        Memory.strategy.idleCreeps = stillIdleCreeps.map(creep => creep.name);

        
    },

    FromStage4ToStage5: () =>
    {
        let shouldTransition = Memory.strategy.finishedContainers.length ===
            Memory.intel[Memory.strategy.roomName].harvestPositions.length;
        if (shouldTransition)
        {
            Stage5.Initialize();
        }
        return shouldTransition;
    }
};

module.exports = Stage5;
