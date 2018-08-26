const BuildJob = require("BuildJob");
const CreepInitial = require("CreepInitial");

let FirstStageStrategy =
{
    Advance: (roomName) =>
    {
        let room = Game.rooms[roomName];
        
        if (room.memory.me)
        {
            let stillIdleCreeps = [];
            for (let creepIter in room.memory.me.idleCreeps)
            {
                let creepName = room.memory.me.idleCreeps[creepIter];
                if (!Game.creeps[creepName])
                {
                    continue;
                }
                let stillIdle = true;
                for (let jobIter in room.memory.me.jobs)
                {
                    let job = room.memory.me.jobs[jobIter];
                    if (job.type === JOB_HARVEST &&
                        job.takenPositions < (1 << job.harvestPositions.length) - 1)
                    {
                        let harvestsLen = job.harvestPositions.length;
                        for (let iter = 0; iter < harvestsLen; ++iter)
                        {
                            let posFlag = (1 << iter);
                            if (!(job.takenPositions & posFlag))
                            {
                                // Assumed to be a CreepInitial since the first stage only creates those
                                CreepInitial.Harvest(Game.creeps[creepName], jobIter, iter);
                                job.takenPositions += posFlag;
                                stillIdle = false;
                                break;
                            }
                        }
                        break;
                    }
                    else if (job.type === JOB_BUILD &&
                        !job.inProgress &&
                        (job.started || BuildJob.CanStart(job, room)))
                    {
                        CreepInitial.Build(Game.creeps[creepName], jobIter);
                        job.started = true;
                        job.inProgress = true;
                        stillIdle = false;
                    }
                }
                
                if (stillIdle)
                {
                    stillIdleCreeps.push(creepName)    
                }
            }
            room.memory.me.idleCreeps = stillIdleCreeps;
        }
        
        let shouldCreateCreep = false;
        for (let jobIter in room.memory.me.jobs)
        {
            let job = room.memory.me.jobs[jobIter];
            if (job.type === JOB_HARVEST &&
                job.takenPositions < (1 << job.harvestPositions.length) - 1)
            {
                shouldCreateCreep = true;
                break;
            }
        }
        if (shouldCreateCreep)
        {
            let spawn = room.find(FIND_MY_SPAWNS)[0];
            spawn.spawnCreep(
                [WORK, CARRY, MOVE],
                Game.time.toString(),
                CreepInitial.SpawnMemory());
        }
    }
};

module.exports = FirstStageStrategy;
