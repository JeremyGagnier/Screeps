const Intel = require("Intel");
const Strategy = require("Strategy.Strategy");

global.ResetMemory = () =>
{
    delete Memory.intel;
    delete Memory.strategy;
    delete Memory.rooms;
    for (let creepName in Memory.creeps)
    {
        if (!Game.creeps[creepName])
        {
            delete Memory.creeps[creepName];
        }
        else
        {
            Memory.creeps[creepName] = {type: Memory.creeps[creepName].type, new: true};
        }
    }
    Intel.Initialize();
    Strategy.Initialize();
}
