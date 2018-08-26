const BuildJob = require("BuildJob");
const HarvestJob = require("HarvestJob");

const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

let JobFinder =
{
    FindJobs: (roomName) =>
    {
        
        let room = Game.rooms[roomName];
        
        let sources = room.find(FIND_SOURCES);
        let jobs = [];
        for (let sourceIter in sources)
        {
            let sourcePos = sources[sourceIter].pos;
            let harvestPositions = [];
            for (let iter in NEIGHBOURS)
            {
                let x = NEIGHBOURS[iter][0] + sourcePos.x;
                let y = NEIGHBOURS[iter][1] + sourcePos.y;
                if (room.lookForAt(LOOK_TERRAIN, x, y).toString() !== "wall")
                {
                    harvestPositions.push({x: x, y: y});
                }
            }
            jobs.push(new HarvestJob(
                {x: sourcePos.x, y: sourcePos.y},
                harvestPositions));
        }
        
        let spawn = room.find(FIND_MY_SPAWNS)[0];
        jobs.push(BuildJob.Construct(
            {x: spawn.pos.x - 1, y: spawn.pos.y},
            {x: spawn.pos.x, y: spawn.pos.y},
            STRUCTURE_CONTAINER));
        
        room.memory.me = {
            jobs: jobs,
            idleCreeps: []
        };
    }
};

module.exports = JobFinder;
