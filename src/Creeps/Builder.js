const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_BUILD = 2;
const STATE_REPAIR = 3;
const STATE_UPGRADE = 4;
const STATE_DIE = 5;

const JOB_BUILD = 0;
const JOB_BUILD_PATH = 1;
const JOB_REPAIR_PATH = 2;
const JOB_UPGRADE = 3;
const JOB_DIE = 4;

function SwapCreepTarget(creep)
{
    let tmp = creep.memory.targetPos;
    creep.memory.targetPos = creep.memory.targetPos2;
    creep.memory.targetPos2 = tmp;
}

// Builders need to be able to construct buildings in arbitrary locations, upgrade the room controller, and build and
// maintain roads and containers along source paths, the spawner path, and the room controller path. They must be able
// to collect resources from a specified location.
let BuilderActions =
{
    Idle: (creep) =>
    {
        Memory.strategy.idleCreeps.push(creep.name);
    },

    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.Move();
        }
    },

    Build: (creep) =>
    {
        creep.Build();
    },

    Repair: (creep) =>
    {
        creep.Repair();
    },

    Upgrade: (creep) =>
    {
        creep.Deposit();
    },

    Die: (creep) =>
    {
        creep.suicide();
    }
}

let Actions = [
    BuilderActions.Idle,
    BuilderActions.Move,
    BuilderActions.Build,
    BuilderActions.Repair,
    BuilderActions.Upgrade,
    BuilderActions.Die
];

let BuilderFSM;

let Builder =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_IDLE;
    },

    Advance: (creep) =>
    {
        creep.memory.state = BuilderFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    FromMoveToMove: (creep) =>
    {
        let shouldTransition = creep.IsEmpty() && creep.DistanceToTarget() <= 1;
        if (shouldTransition)
        {
            creep.Withdraw();
            SwapCreepTarget(creep);
        }
        return shouldTransition;
    },

    FromMoveToBuild: (creep) =>
    {
        return (creep.memory.jobType === JOB_BUILD || creep.memory.jobType === JOB_BUILD_PATH) &&
            !creep.IsEmpty() &&
            creep.DistanceToTarget() <= 3;
    },

    FromMoveToRepair: (creep) =>
    {
        return creep.memory.jobType === JOB_REPAIR_PATH && !creep.IsEmpty() && creep.DistanceToTarget() <= 3;
    },

    FromMoveToUpgrade: (creep) =>
    {
        return creep.memory.jobType === JOB_UPGRADE && !creep.IsEmpty() && creep.DistanceToTarget() <= 3;
    },

    FromMoveToDie: (creep) =>
    {
        return creep.memory.jobType === JOB_DIE && creep.DistanceToTarget() === 0;
    },

    FromBuildToIdle: (creep) =>
    {
        let isFinished = !creep.room.lookForAt(
            LOOK_CONSTRUCTION_SITES,
            creep.memory.targetPos % ROOM_SIZE,
            ~~(creep.memory.targetPos / ROOM_SIZE))[0];
        let shouldTransition = creep.memory.jobType === JOB_BUILD && isFinished;
        if (creep.memory.jobType === JOB_BUILD_PATH && isFinished)
        {
            shouldTransition = true;
            for (let pathIter in creep.memory.path)
            {
                let pos = creep.memory.path[pathIter];
                if (creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos[0], pos[1])[0])
                {
                    shouldTransition = false;
                    break;
                }
            }
        }
        return shouldTransition;
    },

    FromBuildToMove: (creep) =>
    {
        let shouldTransition = creep.memory.jobType === JOB_BUILD && creep.IsEmpty();
        if (creep.memory.jobType === JOB_BUILD_PATH && creep.IsEmpty())
        {
            if (creep.room.lookForAt(
                LOOK_CONSTRUCTION_SITES,
                creep.memory.targetPos % ROOM_SIZE,
                ~~(creep.memory.targetPos / ROOM_SIZE))[0])
            {
                shouldTransition = true;
            }
            else
            {
                for (let pathIter in creep.memory.path)
                {
                    let pos = creep.memory.path[pathIter];
                    if (creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos[0], pos[1])[0])
                    {
                        shouldTransition = true;
                        creep.memory.targetPos = pos[0] + pos[1] * ROOM_SIZE;
                        break;
                    }
                }
            }
        }
        if (shouldTransition)
        {
            SwapCreepTarget(creep);
        }
        return shouldTransition;
    },

    FromRepairToIdle: (creep) =>
    {
        let shouldTransition = false;
        let isFinished = creep.room.lookForAt(
            LOOK_STRUCTURES,
            creep.memory.targetPos % ROOM_SIZE,
            ~~(creep.memory.targetPos / ROOM_SIZE))[0].IsHealthy();
        if (creep.memory.jobType === JOB_REPAIR_PATH && isFinished)
        {
            shouldTransition = true;
            for (let pathIter in creep.memory.path)
            {
                let pos = creep.memory.path[pathIter];
                if (creep.room.lookForAt(LOOK_STRUCTURES, pos[0], pos[1])[0].NeedsRepair())
                {
                    shouldTransition = false;
                    break;
                }
            }
        }
        return shouldTransition;
    },

    FromRepairToMove: (creep) =>
    {
        let shouldTransition = false;
        if (creep.memory.jobType === JOB_REPAIR_PATH && creep.IsEmpty())
        {
            if (!creep.room.lookForAt(
                LOOK_STRUCTURES,
                creep.memory.targetPos % ROOM_SIZE,
                ~~(creep.memory.targetPos / ROOM_SIZE))[0].IsHealthy())
            {
                shouldTransition = true;
            }
            else
            {
                for (let pathIter in creep.memory.path)
                {
                    let pos = creep.memory.path[pathIter];
                    if (creep.room.lookForAt(LOOK_STRUCTURES, pos[0], pos[1])[0].NeedsRepair())
                    {
                        shouldTransition = true;
                        creep.memory.targetPos = pos[0] + pos[1] * ROOM_SIZE;
                        break;
                    }
                }
            }
        }
        if (shouldTransition)
        {
            SwapCreepTarget(creep);
        }
        return shouldTransition;
    },

    FromUpgradeToIdle: (creep) =>
    {
        return false;
    },

    FromUpgradeToMove: (creep) =>
    {
        let shouldTransition = creep.IsEmpty();
        if (shouldTransition)
        {
            SwapCreepTarget(creep);
        }
        return shouldTransition;
    },

    SetBuildJob: (creep, withdrawPos, buildPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_BUILD;
        creep.memory.targetPos = withdrawPos;
        creep.memory.targetPos2 = buildPos;
    },

    SetBuildPathJob: (creep, withdrawPos, path) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_BUILD_PATH;
        creep.memory.targetPos = withdrawPos;
        for (let pathIter in path)
        {
            let pos = path[pathIter];
            if (creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos[0], pos[1])[0])
            {
                creep.memory.targetPos2 = pos[0] + pos[1] * ROOM_SIZE;
                break;
            }
        }
        creep.memory.path = path;
    },

    SetRepairPathJob: (creep, withdrawPos, path) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_REPAIR_PATH;
        creep.memory.targetPos = withdrawPos;
        for (let pathIter in path)
        {
            let pos = path[pathIter];
            if (creep.room.lookForAt(LOOK_STRUCTURES, pos[0], pos[1])[0].NeedsRepair())
            {
                creep.memory.targetPos2 = pos[0] + pos[1] * ROOM_SIZE;
                break;
            }
        }
        creep.memory.path = path;
    },

    SetUpgradeJob: (creep, withdrawPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_UPGRADE;
        creep.memory.targetPos = withdrawPos;
        creep.memory.targetPos2 = creep.room.controller.pos.x + creep.room.controller.pos.y * ROOM_SIZE;
    },

    SetDieJob: (creep, diePos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_DIE;
        creep.memory.targetPos = diePos;
    }
};

BuilderFSM = new FiniteStateMachine([
    new Transition(STATE_MOVE, STATE_MOVE, Builder.FromMoveToMove),
    new Transition(STATE_MOVE, STATE_BUILD, Builder.FromMoveToBuild),
    new Transition(STATE_MOVE, STATE_REPAIR, Builder.FromMoveToRepair),
    new Transition(STATE_MOVE, STATE_UPGRADE, Builder.FromMoveToUpgrade),
    new Transition(STATE_MOVE, STATE_DIE, Builder.FromMoveToDie),

    new Transition(STATE_BUILD, STATE_IDLE, Builder.FromBuildToIdle),
    new Transition(STATE_BUILD, STATE_MOVE, Builder.FromBuildToMove),

    new Transition(STATE_REPAIR, STATE_IDLE, Builder.FromRepairToIdle),
    new Transition(STATE_REPAIR, STATE_MOVE, Builder.FromRepairToMove),

    new Transition(STATE_UPGRADE, STATE_IDLE, Builder.FromUpgradeToIdle),
    new Transition(STATE_UPGRADE, STATE_MOVE, Builder.FromUpgradeToMove)
]);

module.exports = Builder;
