const ExtensionManager = require("ExtensionManager");
const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_MOVE = 0;
const STATE_FILL_EXTENSIONS = 1;
const STATE_FILL_SPAWNER = 2;

let RefillerActions =
{
    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.MoveByPath(creep.memory.forwards);
        }
    },

    FillExtensions: (creep) =>
    {
        if (creep.pos.x + creep.pos.y * ROOM_SIZE !== creep.memory.lastPos)
        {
            creep.memory.fillIndex = 0;
        }
        let extensionsPos = creep.memory.extensionsPos
        if ((creep.pos.x != extensionsPos.x || creep.pos.y != extensionsPos.y) &&
            creep.memory.fillIndex < ExtensionManager.FILLS_BEFORE_MOVE[creep.memory.walkIndex])
        {
            let fillPos =
                ExtensionManager.GetTransformedPosition(creep.memory.totalFillIndex, extensionsPos);
            creep.transfer(creep.room.lookForAt(LOOK_STRUCTURES, fillPos[0], fillPos[1])[0], RESOURCE_ENERGY);
            creep.memory.fillIndex += 1;
            creep.memory.totalFillIndex += 1;
        }
        else if (creep.fatigue <= 0)
        {
            creep.MoveByPath();
        }
    },

    FillSpawner: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.MoveByPath(creep.memory.forwards);
        }
    }
}

let Actions = [
    RefillerActions.Move,
    RefillerActions.FillExtensions,
    RefillerActions.FillSpawner
];

let RefillerFSM;

let Refiller =
{
    Setup: (creep) =>
    {
        let roomIntel = Memory.intel[creep.room.name];
        roomIntel.refiller = creep.name;
        creep.memory.state = STATE_MOVE;
        creep.memory.extensionsPos = roomIntel.extensionsPos;

        creep.memory.path = roomIntel.spawnerToExtensionsPath;
        creep.memory.walkIndex = 0;
        creep.memory.forwards = true;

        creep.memory.fillIndex = 0;
        creep.memory.totalFillIndex = 0;
    },

    Advance: (creep) =>
    {
        creep.memory.state = RefillerFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    FromMoveToTake: (creep) =>
    {
        let pos = creep.memory.extensionsPos;
        return creep.pos.x == pos.x && creep.pos.y == pos.y;
    },

    FromMoveToFillExtensions: (creep) =>
    {
        let extensionsPos = creep.memory.extensionsPos;
        if (creep.pos.x != extensionsPos.x || creep.pos.y != extensionsPos.y)
        {
            return false;
        }
        let shouldTransition = false;
        let roomIntel = Memory.intel[creep.room.name];
        // If the spawner is full we want to fill extensions regardless
        if (creep.room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0].IsFull())
        {
            shouldTransition = true;
        }
        else
        {
            for (let i = 0; i < 30; ++i)
            {
                let pos = ExtensionManager.GetTransformedPosition(i, extensionsPos);
                let maybeExtension = creep.room.lookForAt(LOOK_STRUCTURES, pos[0], pos[1])[0];
                if (!maybeExtension)
                {
                    break;
                }
                else if (!maybeExtension.IsFull())
                {
                    shouldTransition = true;
                    break;
                }
            }
        }
        if (shouldTransition)
        {
            creep.memory.path = ExtensionManager.GetWalkPath(extensionsPos);
            creep.memory.walkIndex = 0;
            creep.memory.fillIndex = 0;
            creep.memory.totalFillIndex = 0;
            creep.withdraw(
                creep.room.lookForAt(LOOK_STRUCTURES, extensionsPos.x, extensionsPos.y)[0],
                RESOURCE_ENERGY);
        }
        return shouldTransition;
    },

    FromMoveToFillSpawner: (creep) =>
    {
        // FromTakeToFillExtensions has already been checked since it appears first so we can assume filling the
        // spawner is ok without checking extensions or if the spawner is full.
        let extensionsPos = creep.memory.extensionsPos;
        let shouldTransition = (creep.pos.x == extensionsPos.x && creep.pos.y == extensionsPos.y);
        if (shouldTransition)
        {
            creep.memory.path = Memory.intel[creep.room.name].spawnerToExtensionsPath;
            creep.memory.walkIndex = creep.memory.path.length - 2;
            creep.memory.forwards = false;
            creep.withdraw(
                creep.room.lookForAt(LOOK_STRUCTURES, extensionsPos.x, extensionsPos.y)[0],
                RESOURCE_ENERGY);
        }
        return shouldTransition;
    },

    FromFillExtensionsToMove: (creep) =>
    {
        // Early return to avoid finding extension
        if (creep.IsEmpty())
        {
            return true;
        }
        let fillPos = ExtensionManager.GetTransformedPosition(creep.memory.totalFillIndex, creep.memory.extensionsPos);
        let shouldTransition = !creep.room.lookForAt(LOOK_STRUCTURES, fillPos[0], fillPos[1])[0];
        if (shouldTransition)
        {
            creep.memory.forwards = creep.memory.walkIndex * 2 >= creep.memory.path.length;
        }
        return shouldTransition;
    },

    FromFillSpawnerToMove: (creep) =>
    {
        let shouldTransition = creep.memory.walkIndex <= 0;
        if (shouldTransition)
        {
            creep.memory.forwards = true;
            let roomIntel = Memory.intel[creep.room.name];
            let spawner = creep.room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0];
            creep.transfer(spawner, RESOURCE_ENERGY);
        }
        return shouldTransition;
    }
}

RefillerFSM = new FiniteStateMachine([
    new Transition(STATE_MOVE, STATE_FILL_EXTENSIONS, Refiller.FromMoveToFillExtensions),
    new Transition(STATE_MOVE, STATE_FILL_SPAWNER, Refiller.FromMoveToFillSpawner),
    new Transition(STATE_FILL_EXTENSIONS, STATE_MOVE, Refiller.FromFillExtensionsToMove),
    new Transition(STATE_FILL_SPAWNER, STATE_MOVE, Refiller.FromFillSpawnerToMove)
]);

module.exports = Refiller;
