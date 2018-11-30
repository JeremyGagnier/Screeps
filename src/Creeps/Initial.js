const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_HARVEST = 2;
const STATE_DEPOSIT = 3;
const STATE_DIE = 4;
const STATE_BUILD = 5;
const STATE_REPAIR = 6;     // Unused

let InitialActions =
{
    Idle: (creep) => {},

    Move: (creep) =>
    {
        if (creep.fatigue <= 0)
        {
            creep.Move();
        }
    },

    Harvest: (creep) =>
    {
        if (creep.Harvest() !== OK)
        {
            creep.memory.state = STATE_IDLE;
        }
    },

    Deposit: (creep) =>
    {
        if (creep.Deposit() !== OK)
        {
            creep.memory.state = STATE_IDLE;
        }
    },

    Die: (creep) =>
    {
        creep.suicide();
    },

    Build: (creep) =>
    {
        if (creep.Build() !== OK)
        {
            creep.memory.state = STATE_IDLE;
        }
    },

    Repair: (creep) =>
    {
        if (creep.Repair() !== OK)
        {
            creep.memory.state = STATE_IDLE;
        }
    }
}

let Actions = [
    InitialActions.Idle,
    InitialActions.Move,
    InitialActions.Harvest,
    InitialActions.Deposit,
    InitialActions.Die,
    InitialActions.Build,
    InitialActions.Repair
];

let InitialFSM;

let Initial =
{
    Setup: (creep) =>
    {
        creep.memory.state = STATE_IDLE;
    },

    Advance: (creep) =>
    {
        if (creep.memory.state === STATE_IDLE)
        {
            Memory.strategy.idleCreeps.push(creep.name);
            return;
        }

        creep.memory.state = InitialFSM.TryTransition(creep.memory.state, creep);
        Actions[creep.memory.state](creep);
    },

    FromMoveToHarvest: (creep) =>
    {
        let shouldTransition = creep.memory.jobType === JOB_HARVEST &&
            !creep.IsFull() &&
            creep.DistanceToTarget() <= 0;
        if (shouldTransition)
        {
            creep.memory.targetPos = creep.memory.sourcePos;
        }
        return shouldTransition;
    },

    FromMoveToDeposit: (creep) =>
    {
        return creep.memory.jobType === JOB_HAUL &&
            !creep.IsEmpty() &&
            creep.DistanceToTarget() <= creep.memory.adjacentDist;
    },

    FromMoveToBuild: (creep) =>
    {
        return creep.memory.jobType === JOB_BUILD &&
            creep.DistanceToTarget() <= 3;
    },

    FromMoveToRepair: (creep) =>
    {
        return creep.memory.jobType === JOB_REPAIR &&
            !creep.IsEmpty() &&
            creep.DistanceToTarget() <= 3;
    },

    FromDepositToIdle: (creep) =>
    {
        return creep.IsEmpty();
    },

    FromHarvestToIdle: (creep) =>
    {
        let shouldTransition = creep.IsFull();
        if (shouldTransition)
        {
            delete creep.memory.sourcePos;
        }
        return shouldTransition;
    },

    FromMoveToDie: (creep) =>
    {
        return creep.memory.jobType === JOB_DIE && creep.DistanceToTarget() <= 0;
    },

    FromBuildToIdle: (creep) =>
    {
        return creep.IsEmpty();
    },

    SetHarvestJob: (creep, harvestPos, sourcePos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_HARVEST;
        creep.memory.targetPos = harvestPos;
        creep.memory.sourcePos = sourcePos;
    },

    SetDepositJob: (creep, depositPos, adjactentDist = 1) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_HAUL;
        creep.memory.targetPos = depositPos;
        creep.memory.adjacentDist = adjactentDist;
    },

    SetBuildJob: (creep, buildPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_BUILD;
        creep.memory.targetPos = buildPos;
    },

    SetDieJob: (creep, diePos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_DIE;
        creep.memory.targetPos = diePos;
    }
}

InitialFSM = new FiniteStateMachine(
[
    new Transition(STATE_MOVE, STATE_HARVEST, Initial.FromMoveToHarvest),
    new Transition(STATE_MOVE, STATE_DEPOSIT, Initial.FromMoveToDeposit),
    new Transition(STATE_MOVE, STATE_BUILD, Initial.FromMoveToBuild),
    new Transition(STATE_MOVE, STATE_REPAIR, Initial.FromMoveToRepair),
    new Transition(STATE_MOVE, STATE_DIE, Initial.FromMoveToDie),

    new Transition(STATE_DEPOSIT, STATE_IDLE, Initial.FromDepositToIdle),

    new Transition(STATE_HARVEST, STATE_IDLE, Initial.FromHarvestToIdle),

    new Transition(STATE_BUILD, STATE_IDLE, Initial.FromBuildToIdle)
]);

module.exports = Initial;
