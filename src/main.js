require("Constants");
require("Extends.Creep");
require("Extends.StructureSpawn");
require("Util");

const Intel = require("Intel");
const Strategy = require("Strategy.Strategy");

const ROOM_SCAN_FREQUENCY = 60;

module.exports.loop = () =>
{
    if (!Memory.strategy)
    {
        Intel.Initialize();
        Strategy.Initialize();
    }

    for (let creepName in Game.creeps)
    {
        try
        {
            let creep = Game.creeps[creepName];
            let prevState = creep.memory.state;
            creep.Advance();
            // Check if the creep became idle
            if (prevState !== 0 && creep.memory.state === 0)
            {
                Memory.strategy.idleCreeps.push(creepName);
            }
        }
        catch(error)
        {
            console.log("Failed to advance creep: " + creepName, error.stack);
        }
    }

    try
    {
        Strategy.Advance();
    }
    catch(error)
    {
        console.log("Failed to advance strategy", error.stack);
        // Advance failures can cause idle creeps to stay idle, so add them back to the list
        for (let creepName in Game.creeps)
        {
            if (Memory.creeps[creepName].state === 0 && !Memory.strategy.idleCreeps.includes(creepName))
            {
                Memory.strategy.idleCreeps.push(creepName);
            }
        }
    }
}
