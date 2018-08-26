const STATE_MOVE_TO_HARVEST = 0;
const STATE_HARVEST = 1;
const STATE_MOVE_TO_DEPOSIT = 2;
const STATE_DEPOSIT = 3;

const STATE_GET_ENERGY = 0;
const STATE_BUILD = 1;

let CreepInitial =
{
    Advance: (creep) =>
    {
        function ReleaseJob()
        {
            if (creep.memory.me.harvestJob)
            {
                let harvestJob = creep.memory.me.harvestJob;
                let roomMem = creep.room.memory.me;
                roomMem.jobs[harvestJob.jobIndex].takenPositions -= (1 << harvestJob.harvestPositionIndex);
                roomMem.idleCreeps.push(creep.name);
                delete creep.memory.me.harvestJob;
            }
            else if (creep.memory.me.buildJob)
            {
                let buildJob = creep.memory.me.buildJob;
                let roomMem = creep.room.memory.me;
                roomMem.jobs[buildJob.jobIndex].inProgress = false;
                roomMem.idleCreeps.push(creep.name);
                delete creep.memory.me.buildJob;
            }
        }
        
        function IsAdjacent(a, b, maxDist = 1)
        {
            return Math.abs(a.x - b.x) <= maxDist && Math.abs(a.y - b.y) <= maxDist;
        }
        
        if (creep.memory.me.justSpawned)
        {
            creep.memory = {me: {type: CREEP_INITIAL}};
            creep.room.memory.me.idleCreeps.push(creep.name);
        }
        
        if (creep.ticksToLive <= 0)
        {
            ReleaseJob();
            delete Memory.creeps[creep.name];
            return;
        }
        
        if (creep.memory.me.harvestJob)
        {
            let state = creep.memory.me.harvestJob.state;
            if (state === STATE_MOVE_TO_HARVEST)
            {
                let target = creep.memory.me.harvestJob.targetPosition;
                if (creep.pos.x === target.x && creep.pos.y === target.y)
                {
                    let harvestJob = creep.memory.me.harvestJob;
                    harvestJob.state = STATE_HARVEST;
                    harvestJob.targetPosition = creep.room.memory.me.jobs[harvestJob.jobIndex].targetPosition;
                }
                else if (!creep.fatigue)
                {
                    creep.moveTo(target.x, target.y, {reusePath: 3});
                }
            }
            if (state === STATE_HARVEST)
            {
                if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity)
                {
                    let harvestJob = creep.memory.me.harvestJob;
                    let spawn = creep.room.find(FIND_MY_SPAWNS)[0];
                    harvestJob.state = STATE_MOVE_TO_DEPOSIT;
                    harvestJob.targetPosition = {x: spawn.pos.x, y: spawn.pos.y};
                }
                else if (!creep.fatigue)
                {
                    let target = creep.memory.me.harvestJob.targetPosition;
                    creep.harvest(creep.room.lookForAt(LOOK_SOURCES, target.x, target.y)[0]);
                }
            }
            if (state === STATE_MOVE_TO_DEPOSIT)
            {
                let target = creep.memory.me.harvestJob.targetPosition;
                if (IsAdjacent(creep.pos, target, creep.memory.me.harvestJob.depositDist))
                {
                    creep.memory.me.harvestJob.state = STATE_DEPOSIT;
                }
                else if (!creep.fatigue)
                {
                    creep.moveTo(target.x, target.y, {reusePath: 3});
                }
            }
            if (state === STATE_DEPOSIT)
            {
                if (creep.carry[RESOURCE_ENERGY] <= 0) 
                {
                    ReleaseJob();
                }
                else if (!creep.fatigue)
                {
                    let target = creep.memory.me.harvestJob.targetPosition;
                    let tryTransfer = creep.transfer(
                        creep.room.lookForAt(LOOK_STRUCTURES, target.x, target.y)[0],
                        RESOURCE_ENERGY);
                    if (tryTransfer === ERR_FULL)
                    {
                        creep.memory.me.harvestJob.state = STATE_MOVE_TO_DEPOSIT;
                        creep.memory.me.harvestJob.targetPosition = {x: creep.room.controller.pos.x, y: creep.room.controller.pos.y};
                        creep.memory.me.harvestJob.depositDist = 3;
                    }
                }
            }
        }
        else if (creep.memory.me.buildJob)
        {
            let state = creep.memory.me.buildJob.state;
            if (state === STATE_BUILD)
            {
                let target = creep.memory.me.buildJob.targetPosition;
                if (creep.carry[RESOURCE_ENERGY] <= 0) 
                {
                    creep.memory.me.buildJob.state = STATE_GET_ENERGY;
                }
                else if (IsAdjacent(creep.pos, target, 3) && !creep.fatigue)
                {
                    let tryBuild = creep.build(creep.room.lookForAt(
                        LOOK_CONSTRUCTION_SITES,
                        target.x,
                        target.y)[0]);
                    if (tryBuild === ERR_INVALID_TARGET)
                    {
                        creep.room.memory.me.jobs[creep.memory.me.buildJob.jobIndex] = {type: -1};
                        ReleaseJob();
                    }
                }
            }
            else if (state === STATE_GET_ENERGY)
            {
                let source = creep.memory.me.buildJob.sourcePosition;
                if (IsAdjacent(creep.pos, source))
                {
                    creep.withdraw(
                        creep.room.lookForAt(LOOK_STRUCTURES, source.x, source.y)[0],
                        RESOURCE_ENERGY);
                    creep.memory.me.buildJob.state = STATE_BUILD;
                }
                else if (!creep.fatigue)
                {
                    creep.moveTo(source.x, source.y, {reusePath: 3});
                }
            }
        }
    },
    
    Harvest: (creep, jobIndex, harvestPositionIndex) =>
    {
        let job = creep.room.memory.me.jobs[jobIndex];
        creep.memory.me.harvestJob = {
            targetPosition: job.harvestPositions[harvestPositionIndex],
            jobIndex: jobIndex,
            harvestPositionIndex: harvestPositionIndex,
            state: STATE_MOVE_TO_HARVEST
        };
    },
    
    Build: (creep, jobIndex) =>
    {
        let job = creep.room.memory.me.jobs[jobIndex];
        creep.memory.me.buildJob = {
            targetPosition: job.targetPosition,
            sourcePosition: job.sourcePosition,
            jobIndex: jobIndex,
            state: STATE_GET_ENERGY
        }
    },
    
    SpawnMemory: () =>
    {
        return {memory: {me: {justSpawned: true, type: CREEP_INITIAL}}};
    }
};

module.exports = CreepInitial;
