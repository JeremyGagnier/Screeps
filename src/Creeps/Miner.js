const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

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
            creep.memory.walkIndex += 1;
            if (creep.memory.toExtensions && creep.memory.walkIndex >= roomIntel.spawnerToExtensionsPath.length)
            {
                creep.memory.toExtensions = false;
                creep.memory.walkIndex = 1;
            }

            let to;
            if (creep.memory.toExtensions)
            {
                to = roomIntel.spawnerToExtensionsPath[creep.memory.walkIndex];
            }
            else
            {
                to = roomIntel.sourcePaths[creep.memory.walkIndex];
            }
            if (creep.move(DIRECTIONS[to.y - creep.pos.y + 1][to.x - creep.pos.x + 1]) !== 0)
            {
                creep.memory.walkIndex -= 1;
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
    MinerActions.Move,
    MinerActions.Mine
];

let MinerFSM;

let Miner =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.walkIndex = 0;
        creep.memory.toExtensions = true;
    },

    Advance: (creep) =>
    {
        creep.memory.state = MinerFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    SetHarvestJob: (creep, harvestPos, sourceIndex) =>
    {
        creep.memory.sourceIndex = sourceIndex;
        creep.memory.harvestPos = harvestPos;
    },

    FromMoveToMine: (creep) =>
    {
        let path = Memory.intel[creep.room.name].sourcePaths[creep.memory.sourceIndex];
        return !creep.memory.toExtensions && creep.memory.walkIndex + 1 >= path.length;
    }
}

MinerFSM = new FiniteStateMachine(
[
    new Transition(STATE_MOVE, STATE_MINE, Miner.FromMoveToMine)
]);

module.exports = Miner;
