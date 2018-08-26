const CreepInitial = require("CreepInitial");
const FirstStageStrategy = require("FirstStageStrategy");
const JobFinder = require("JobFinder");

// Job type enum
global.JOB_HARVEST = 0;
global.JOB_HAUL = 1;
global.JOB_BUILD = 2;

// Creep type enum
global.CREEP_INITIAL = 0;
global.CREEP_HARVESTER = 1;
global.CREEP_HAULER = 2;
global.CREEP_BUILDER = 3;

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
