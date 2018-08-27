const CreepInitial = require("CreepInitial");
const FirstStageStrategy = require("FirstStageStrategy");
const JobFinder = require("JobFinder");

// Job type enum
global.JOB_HARVEST = 0;
global.JOB_HAUL = 1;
global.JOB_BUILD = 2;
global.JOB_REPAIR = 3;

// Creep type enum
global.CREEP_INITIAL = 0;
global.CREEP_MINER = 1;
global.CREEP_HAULER = 2;
global.CREEP_BUILDER = 3;
global.CREEP_REFILLER = 4;

global.IsAdjacent = (pos1, pos2, maxDist = 1) =>
{
    return pos1.room === pos2.room && Math.abs(pos1.x - pos2.x) <= maxDist && Math.abs(pos1.y - pos2.y) <= maxDist;
}

module.exports.loop = () =>
{
    for (let roomName in Game.rooms)
    {
        let room = Game.rooms[roomName];
        if (!room.controller || !room.controller.my)
        {
            continue;
        }
        
        if (!room.memory.me)
        {
            JobFinder.FindJobs(roomName);
        }
        else
        {
            FirstStageStrategy.Advance(roomName);
        }
    }
    
    for (let creepName in Game.creeps)
    {
        let creep = Game.creeps[creepName];
        if (creep.spawning)
        {
            continue;
        }
        
        if (creep.memory.me.type === CREEP_INITIAL)
        {
            CreepInitial.Advance(creep);
        }
        else
        {
            console.log("Creep type " + creep.type.toString() + " not implemented");
        }
    }
};
