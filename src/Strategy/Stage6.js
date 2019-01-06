const PathManager = require("PathManager");
const SpawnManager = require("SpawnManager");
const StrategyUtil = require("Strategy.StrategyUtil");

/**
 * Stage 6s purpose is to convert the rooms energy into control points as efficiently as possible.
 */
let Stage6;
Stage6 =
{
    Initialize: () =>
    {
    },

    Advance: () =>
    {
        
    },

    FromStage5ToStage6: () =>
    {
        let roomIntel = Memory.intel[Memory.strategy.roomName];
        let shouldTransition = roomIntel.refiller !== null &&
            !roomIntel.haulers.find((x) => x === null) &&
            !roomIntel.harvesters.find((x) => x === null);
        if (shouldTransition)
        {
            Stage6.Initialize();
        }
        return shouldTransition;
    }
}
