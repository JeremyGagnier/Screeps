const ExtensionManager = require("ExtensionManager");
const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_MOVE_TO_PATH = 0;
const STATE_TAKE = 1;
const STATE_FILL = 2;

let RefillerActions =
{
    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.memory.walkIndex += 1;
            let to = Memory.intel[creep.room.name].spawnerToExtensionsPath[creep.memory.walkIndex];
            if (creep.move(DIRECTIONS[to.y - creep.pos.y + 1][to.x - creep.pos.x + 1]) !== 0)
            {
                // Returns nonzero when path is blocked by another creep
                creep.memory.walkIndex -= 1;
            }
        }
    },

    Take: (creep) =>
    {
        let containerPos = creep.memory.extensionsPos;
        let container = room.lookForAt(LOOK_STRUCTURES, containerPos.x, containerPos.y)[0];
        creep.withdraw(container, RESOURCE_ENERGY);
        if (!creep.IsEmpty() && creep.fatigue <= 0)
        {
            let to = ExtensionManager.GetWalkPosition(0, creep.memory.extensionsPos);
            creep.move(DIRECTIONS[to.y - creep.pos.y + 1][to.x - creep.pos.x + 1]);
        }
    },

    Fill: (creep) =>
    {
        if (!creep.memory.skipping &&
            creep.memory.fillIndex < ExtensionManager.FILLS_BEFORE_MOVE[creep.memory.walkIndex])
        {
            let fillPos =
                ExtensionManager.GetTransformedPosition(creep.memory.totalFillIndex, creep.memory.extensionsPos);
            let maybeExtension = room.lookForAt(LOOK_STRUCTURES, fillPos.x, fillPos.y)[0];
            if (maybeExtension && !creep.IsEmpty())
            {
                creep.transfer(maybeExtension, RESOURCE_ENERGY);
                creep.memory.fillIndex += 1;
                creep.memory.totalFillIndex += 1;
            }
            else
            {
                creep.memory.skipping = true;
            }
        }
        else if (creep.fatigue <= 0)
        {
            creep.memory.walkIndex += 1;
            let to = ExtensionManager.GetWalkPosition(creep.memory.walkIndex, creep.memory.extensionsPos);
            if (creep.move(DIRECTIONS[to.y - creep.pos.y + 1][to.x - creep.pos.x + 1]) === 0)
            {
                creep.memory.fillIndex = 0;
            }
            else
            {
                // Returns nonzero when path is blocked by another creep
                console.log("Refiller got blocked by a creep, this shouldn't happen!");
                creep.memory.walkIndex -= 1;
            }
        }
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
        creep.memory.state = STATE_MOVE_TO_PATH;
        let extensionsPos = Memory.intel[creep.room.name].extensionsPos;
        creep.memory.extensionsPos = extensionsPos;
        creep.memory.walkIndex = 0;
        creep.memory.fillIndex = 0;
        creep.memory.totalFillIndex = 0;
        creep.memory.skipping = false;
    },

    Advance: (creep) =>
    {
        creep.memory.state = RefillerFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    FromMoveToTake: (creep) =>
    {
        let pos = creep.memory.extensionsPos;
        let shouldTransition = creep.pos.x == pos[0] && creep.pos.y == pos[1];
        if (shouldTransition)
        {
            creep.memory.walkIndex = 0;
        }
        return shouldTransition;
    },

    FromTakeToFill: (creep) =>
    {
        let pos = ExtensionManager.GetWalkPosition(0, creep.memory.extensionsPos);
        let shouldTransition = creep.pos.x == pos[0] && creep.pos.y == pos[1];
        if (shouldTransition)
        {
            creep.memory.walkIndex = 0;
            creep.memory.fillIndex = 0;
            creep.memory.totalFillIndex = 0;
        }
        return shouldTransition;
    },

    FromFillToTake: (creep) =>
    {
        let pos = creep.memory.extensionsPos;
        let shouldTransition = creep.pos.x == pos[0] && creep.pos.y == pos[1];
        if (shouldTransition)
        {
            creep.memory.skipCycle = false;
        }
        return shouldTransition;
    }
}


RefillerFSM = new FiniteStateMachine([
    new Transition(STATE_MOVE_TO_PATH, STATE_TAKE, Refiller.FromMoveToTake),
    new Transition(STATE_TAKE, STATE_FILL, Refiller.FromTakeToFill),
    new Transition(STATE_FILL, STATE_TAKE, Refiller.FromFillToTake)
]);

module.exports = Refiller;
