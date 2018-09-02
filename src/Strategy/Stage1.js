const Stage2 = require("Strategy.Stage2");
const StrategyUtil = require("Strategy.StrategyUtil");

let Stage1 =
{
    Advance: () =>
    {
        let roomName = Memory.strategy.roomName;
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
            roomIntel.harvesters[job.sourcePosIter][job.harvestPosIter] = creep.name;
        }

        Memory.strategy.idleCreeps = stillIdleCreeps.map(creep => creep.name);

        if (shouldSpawnCreep)
        {
            let has300 = spawner.energy >= 300;
            if (Object.keys(Game.creeps).length >= 2 || has300)
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

module.exports = Stage1;
