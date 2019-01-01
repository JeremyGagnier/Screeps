const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE_TO_PATH = 1;
const STATE_HAUL = 2;

let HaulerActions;
HaulerActions =
{
    Idle: (creep) =>
    {
        Memory.strategy.idleCreeps.push(creep.name);
    },

    MoveToPath: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            if (creep.memory.walkIndex >= creep.memory.path.length)
            {
                creep.memory.state = STATE_HAUL;
                creep.memory.pickingUp = true;

                creep.memory.path = Memory.intel[creep.room.name].sourcePaths[creep.memory.sourceIndex];
                creep.memory.walkIndex = 0;
            }
            creep.MoveByPath();
        }
    },

    Haul: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            if (creep.memory.pickingUp)
            {
                let path = creep.memory.path;
                if (creep.memory.walkIndex >= path.length - 1)
                {
                    creep.memory.pickingUp = false;
                    creep.memory.walkIndex = path.length - 3;
                    let container = creep.room.lookForAt(LOOK_STRUCTURES, to[0], to[1])[0];
                    if (container)
                    {
                        creep.withdraw(container, RESOURCE_ENERGY);
                    }
                    else
                    {
                        console.log("Hauler didn't end up next to a container for withdraw")
                    }
                    HaulerActions.Haul(creep);
                }
                else
                {
                    creep.MoveByPath();
                }
            }
            else
            {
                let path = creep.memory.path;
                if (creep.memory.walkIndex <= 0)
                {
                    creep.memory.pickingUp = true;
                    creep.memory.walkIndex = 2;
                    let container = creep.room.lookForAt(LOOK_STRUCTURES, to[0], to[1])[0];
                    if (container)
                    {
                        creep.transfer(container, RESOURCE_ENERGY);
                    }
                    else
                    {
                        console.log("Hauler didn't end up next to a container for deposit")
                    }
                    HaulerActions.Haul(creep);
                }
                else if (creep.move(DIRECTIONS[to.y - creep.pos.y + 1][to.x - creep.pos.x + 1]) !== 0)
                {
                    creep.memory.walkIndex += 1;
                }
            }
        }
    }
}

let Actions = [
    HaulerActions.Idle,
    HaulerActions.MoveToPath,
    HaulerActions.Haul
];

let Hauler =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_IDLE;

        creep.memory.path = roomIntel.spawnerToExtensionsPath;
        creep.memory.walkIndex = 1;
        creep.memory.lastPos = creep.pos.x + creep.pos.y * ROOM_SIZE;
    },

    Advance: (creep) =>
    {
        Actions[creep.memory.state](creep);
    },

    SetDepositJob: (creep, sourceIndex) =>
    {
        creep.memory.sourceIndex = sourceIndex;
    }
}

module.exports = Hauler;
