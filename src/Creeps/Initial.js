const FiniteStateMachine = require("./../FiniteStateMachine");
const Transition = require("./../Transition");

const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_HARVEST = 2;
const STATE_DEPOSIT = 3;
const STATE_GET_ENERGY = 4;
const STATE_BUILD = 5;
const STATE_REPAIR = 6;

let InitialFSM;

let Initial =
{
    Setup: (creep) =>
    {
        creep.memory.type = CREEP_INITIAL;
        creep.memory.state = STATE_IDLE;
    },

    Advance: (creep) =>
    {
        if (creep.memory.state === STATE_IDLE)
        {
            return;
        }

        creep.memory.state = InitalFSM.TryTransition(creep.memory.state, creep);
        switch(creep.memory.state)
        {
            case STATE_MOVE:
                creep.Move();
                break;

            case STATE_HARVEST:
                if (!creep.Harvest())
                {
                    creep.memory.state = STATE_MOVE;
                    creep.memory.targetPos = creep.memory.secondaryPos;
                }
                break;

            case STATE_DEPOSIT:
                if (!creep.Deposit())
                {
                    creep.memory.targetPos = creep.room.controller.pos;
                }
                break;

            case STATE_GET_ENERGY:
                if (!creep.Withdraw())
                {
                    creep.memory.state = STATE_IDLE;
                }
                break;

            case STATE_BUILD:
                if (!creep.Build())
                {
                    creep.memory.state = STATE_IDLE;
                }
                break;

            case STATE_REPAIR:
                if (!creep.Repair())
                {
                    creep.memory.state = STATE_IDLE;
                }
        }
    },

    FromMoveToHarvest: (creep) =>
    {
        return creep.memory.jobType === JOB_HARVEST &&
            !creep.IsFull() &&
            IsAdjacent(creep.pos, creep.memory.targetPos, 0);
    },

    FromMoveToDeposit: (creep) =>
    {
        return (creep.memory.jobType === JOB_HARVEST || creep.memory.jobType === JOB_HAUL) &&
            !creep.IsEmpty() &&
            IsAdjacent(creep.pos, creep.memory.targetPos, creep.memory.adjacentDist);
    },

    FromMoveToGetEnergy: (creep) =>
    {
        return (creep.memory.jobType === JOB_BUILD || creep.memory.jobType === JOB_HAUL) &&
            creep.IsEmpty() &&
            IsAdjacent(creep.pos, creep.memory.targetPos);
    },

    FromMoveToBuild: (creep) =>
    {
        return creep.memory.jobType === JOB_BUILD &&
            !creep.IsEmpty() &&
            IsAdjacent(creep.pos, creep.memory.targetPos, 3);
    },

    FromMoveToRepair: (creep) =>
    {
        return creep.memory.jobType === JOB_REPAIR &&
            !creep.IsEmpty() &&
            IsAdjacent(creep.pos, creep.memory.targetPos, 3);
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
            if (creep.room.lookForAt(LOOK_STRUCTURES, creep.memory.secondaryPos)[0].IsFull())
            {
                creep.memory.targetPos = creep.room.controller.pos;
            }
            else
            {
                creep.memory.targetPos = creep.memory.secondaryPos;
            }
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

    SetHarvestJob: (creep, harvestPos, dumpPos) =>
    {
        creep.memory.state = STATE_MOVE;
        creep.memory.jobType = JOB_HARVEST;
        creep.memory.targetPos = harvestPos;
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
