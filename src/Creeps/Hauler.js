const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE_TO_PATH = 1;
const STATE_HAUL = 2;

let HaulerActions =
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
                creep.memory.state = STATE_IDLE;
            }
            creep.MoveByPath();
        }
    },

    Haul: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            let path = creep.memory.path;
            if (creep.memory.pickingUp)
            {
                if (creep.memory.walkIndex >= path.length - 2)
                {
                    creep.memory.pickingUp = false;
                    let containerPos = path[path.length - 1];
                    let container = creep.room.lookForAt(LOOK_STRUCTURES, containerPos[0], containerPos[1])[0];
                    if (container)
                    {
                        creep.withdraw(container, RESOURCE_ENERGY);
                    }
                    else
                    {
                        console.log("Hauler didn't end up next to a container for withdraw")
                    }
                }
            }
            else
            {
                if (creep.memory.walkIndex <= 1)
                {
                    creep.memory.pickingUp = true;
                    let containerPos = path[0];
                    let container = creep.room.lookForAt(LOOK_STRUCTURES, containerPos[0], containerPos[1])[0];
                    if (container)
                    {
                        creep.transfer(container, RESOURCE_ENERGY);
                    }
                    else
                    {
                        console.log("Hauler didn't end up next to a container for deposit")
                    }
                }
            }
            creep.MoveByPath(creep.memory.pickingUp);
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
        creep.memory.state = STATE_MOVE_TO_PATH;

        creep.memory.path = Memory.intel[creep.room.name].spawnerToExtensionsPath;
        creep.memory.walkIndex = 0;
        creep.memory.lastPos = creep.pos.x + creep.pos.y * ROOM_SIZE;
    },

    Advance: (creep) =>
    {
        Actions[creep.memory.state](creep);
    },

    SetDepositJob: (creep, sourceIndex) =>
    {
        creep.memory.state = STATE_HAUL;
        creep.memory.pickingUp = true;
        creep.memory.walkIndex = 1;
        creep.memory.path = Memory.intel[creep.room.name].sourcePaths[sourceIndex];
    }
}

module.exports = Hauler;
