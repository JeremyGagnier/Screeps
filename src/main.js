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
            console.error("Failed to advance creep: " + creepName, error);
        }
    }

    /*if ((Game.time % ROOM_SCAN_FREQUENCY) === 0)
    {
        for (let roomName in Game.rooms)
        {
            if (!Memory.intel[roomName])
            {
                Intel.ScanRoom(Game.rooms[roomName]);
            }
        }
    }*/

    try
    {
        Strategy.Advance();
    }
    catch(error)
    {
        console.error("Failed to advance strategy", error);
    }
}
