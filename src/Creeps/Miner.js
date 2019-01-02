const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_MINE = 2;

let MinerActions =
{
    Idle: (creep) =>
    {
        Memory.strategy.idleCreeps.push(creep.name);
    },

    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            let roomIntel = Memory.intel[creep.room.name];
            if (creep.memory.toExtensions && creep.memory.walkIndex >= roomIntel.spawnerToExtensionsPath.length)
            {
                creep.memory.toExtensions = false;
                creep.memory.walkIndex = 1;
                creep.memory.path = roomIntel.sourcePaths[creep.memory.sourceIndex];
            }
            if (creep.memory.walkIndex >= roomIntel.sourcePaths[creep.memory.sourceIndex].length)
            {
                creep.memory.state = STATE_MINE;
            }
            else
            {
                creep.MoveByPath();
            }
        }
    },

    Mine: (creep) =>
    {
        let pos = creep.memory.harvestPos;
        let source = creep.room.lookForAt(LOOK_SOURCES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE))[0];
        if (source)
        {
            creep.harvest(source);
        }
        else
        {
            console.log("Miner didn't end up next to a source")
        }
    }
}

let Actions = [
    MinerActions.Idle,
    MinerActions.Move,
    MinerActions.Mine
];

let Miner =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_IDLE;
        creep.memory.walkIndex = 0;
        creep.memory.path = Memory.intel[creep.room.name].spawnerToExtensionsPath;
        creep.memory.toExtensions = true;
    },

    Advance: (creep) =>
    {
        Actions[creep.memory.state](creep);
    },

    SetHarvestJob: (creep, harvestPos, sourceIndex) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.sourceIndex = sourceIndex;
        creep.memory.harvestPos = harvestPos;
    }
}

module.exports = Miner;
