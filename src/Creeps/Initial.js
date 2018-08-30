const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_HARVEST = 2;
const STATE_DEPOSIT = 3;
const STATE_GET_ENERGY = 4;
const STATE_BUILD = 5;
const STATE_REPAIR = 6;

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
        creep.Harvest();
    },

    Deposit: (creep) =>
    {
        if (creep.Deposit() !== OK)
        {
            let pos = creep.room.controller.pos;
            creep.memory.targetPos = pos.x + ROOM_SIZE * pos.y;
            creep.memory.adjacentDist = 3;
            creep.memory.state = STATE_MOVE;
        }
    },

    GetEnergy: (creep) =>
    {
        if (creep.Withdraw() !== OK)
        {
            creep.memory.state = STATE_IDLE;
        }
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
    },
}

let Actions = [
    InitialActions.Idle,
    InitialActions.Move,
    InitialActions.Harvest,
    InitialActions.Deposit,
    InitialActions.GetEnergy,
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
        return (creep.memory.jobType === JOB_HARVEST || creep.memory.jobType === JOB_HAUL) &&
            !creep.IsEmpty() &&
            creep.DistanceToTarget() <= creep.memory.adjacentDist;
    },

    FromMoveToGetEnergy: (creep) =>
    {
        return (creep.memory.jobType === JOB_BUILD || creep.memory.jobType === JOB_HAUL) &&
            creep.IsEmpty() &&
            creep.DistanceToTarget() <= 1;
    },

    FromMoveToBuild: (creep) =>
    {
        return creep.memory.jobType === JOB_BUILD &&
            !creep.IsEmpty() &&
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

    FromHarvestToMove: (creep) =>
    {
        let shouldTransition = creep.IsFull();
        if (shouldTransition)
        {
            let pos = creep.memory.secondaryPos;
            if (creep.room.lookForAt(LOOK_STRUCTURES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE))[0].IsFull())
            {
                let pos = creep.room.controller.pos;
                creep.memory.targetPos = pos.x + ROOM_SIZE * pos.y;
                creep.memory.adjacentDist = 3;
            }
            else
            {
                creep.memory.targetPos = pos;
                creep.memory.adjacentDist = 1;
            }
            delete creep.memory.sourcePos;
        }
        return shouldTransition;
    },

    FromGetEnergyToMove: (creep) =>
    {
        let shouldTransition = !creep.IsEmpty();
        if (shouldTransition)
        {
            let tmp = creep.memory.targetPos;
            creep.memory.targetPos = creep.memory.secondaryPos;
            creep.memory.secondaryPos = tmp;
        }
        return shouldTransition;
    },

    FromBuildToMove: (creep) =>
    {
        let shouldTransition = creep.IsEmpty();
        if (shouldTransition)
        {
            let tmp = creep.memory.targetPos;
            creep.memory.targetPos = creep.memory.secondaryPos;
            creep.memory.secondaryPos = tmp;
        }
        return shouldTransition;
    },

    SetHarvestJob: (creep, harvestPos, sourcePos, dumpPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_HARVEST;
        creep.memory.targetPos = harvestPos;
        creep.memory.sourcePos = sourcePos;
        creep.memory.secondaryPos = dumpPos;
    },

    SetBuildJob: (creep, getEnergyPos, buildPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_BUILD;
        if (creep.IsEmpty())
        {
            creep.memory.targetPos = getEnergyPos;
            creep.memory.secondaryPos = buildPos;
        }
        else
        {
            creep.memory.targetPos = buildPos;
        }
    },

    SetRepairJob: (creep, getEnergyPos, repairPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_REPAIR;
        if (creep.IsEmpty())
        {
            creep.memory.targetPos = getEnergyPos;
            creep.memory.secondaryPos = repairPos;
        }
        else
        {
            creep.memory.targetPos = repairPos;
        }
    }
}

InitialFSM = new FiniteStateMachine(
[
    new Transition(STATE_MOVE, STATE_HARVEST, Initial.FromMoveToHarvest),
    new Transition(STATE_MOVE, STATE_DEPOSIT, Initial.FromMoveToDeposit),
    new Transition(STATE_MOVE, STATE_GET_ENERGY, Initial.FromMoveToGetEnergy),
    new Transition(STATE_MOVE, STATE_BUILD, Initial.FromMoveToBuild),
    new Transition(STATE_MOVE, STATE_REPAIR, Initial.FromMoveToRepair),

    new Transition(STATE_DEPOSIT, STATE_IDLE, Initial.FromDepositToIdle),

    new Transition(STATE_HARVEST, STATE_MOVE, Initial.FromHarvestToMove),

    new Transition(STATE_GET_ENERGY, STATE_MOVE, Initial.FromGetEnergyToMove),

    new Transition(STATE_BUILD, STATE_MOVE, Initial.FromBuildToMove)
]);

module.exports = Initial;
