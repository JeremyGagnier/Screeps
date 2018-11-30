const ExtensionManager = require("ExtensionManager");
const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_MOVE = 0;
const STATE_TAKE = 1;
const STATE_FILL = 2;
const DIRECTIONS = [
    [TOP_LEFT   , TOP      , TOP_RIGHT   ],
    [LEFT       , undefined, RIGHT       ],
    [BOTTOM_LEFT, BOTTOM   , BOTTOM_RIGHT]
];

let RefillerActions =
{
    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.memory.walkIndex += 1;
            let path = Memory.intel[creep.room.name].spawnerToExtensionsPath;
            let to;
            if (creep.memory.walkIndex >= path.length)
            {
                to = creep.memory.startingPos;
            }
            else
            {
                to = path[creep.memory.walkIndex];
            }
            let dx = to.x - creep.pos.x;
            let dy = to.y - creep.pos.y;
            if (creep.move(DIRECTIONS[dy + 1][dx + 1]) !== 0)
            {
                // Returns nonzero when path is blocked by another creep
                creep.memory.walkIndex -= 1;
            }
        }
    },

    Take: (creep) =>
    {

        //let containerPos = Memory.intel[creep.room.name].extensionsPos;
        //let container = room.lookForAt(LOOK_STRUCTURES, containerPos.x, containerPos.y)[0];
    },

    Fill: (creep) =>
    {

    }
}

let Actions = [
    RefillerActions.Move,
    RefillerActions.Take,
    RefillerActions.Fill
];

let RefillerFSM;

let Refiller =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_MOVE;
        let extensionsPos = Memory.intel[creep.room.name].extensionsPos;
        creep.memory.startingPos = ExtensionManager.GetTransformedPosition(0, extensionsPos);
        creep.memory.walkIndex = 0;
        creep.memory.fillIndex = 0;
    },

    Advance: (creep) =>
    {
        creep.memory.state = RefillerFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    FromMoveToTake: (creep) =>
    {
        let shouldTransition =
            creep.pos.x == creep.memory.startingPos[0] && creep.pos.y == creep.memory.startingPos[1];
        if (shouldTransition)
        {
            creep.memory.walkIndex = 0;
        }
        return shouldTransition;
    },

    FromTakeToFill: (creep) =>
    {
        return !creep.IsEmpty();
    },

    FromFillToTake: (creep) =>
    {
        return creep.IsEmpty() ||
            (creep.pos.x == creep.memory.startingPos[0] && creep.pos.y == creep.memory.startingPos[1]);
    }
}


InitialFSM = new FiniteStateMachine(
[
    new Transition(STATE_MOVE, STATE_TAKE, Refiller.FromMoveToTake),
    new Transition(STATE_TAKE, STATE_FILL, Refiller.FromTakeToFill),
    new Transition(STATE_FILL, STATE_TAKE, Refiller.FromFillToTake)
]);

module.exports = Refiller;
