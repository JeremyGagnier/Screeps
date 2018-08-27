const DEATH_THRESHOLD = 3;

let CreepInital = require("./../Creeps/Initial");
let CreepMiner = require("./../Creeps/Miner");
let CreepHauler = require("./../Creeps/Hauler");
let CreepBuilder = require("./../Creeps/Builder");
let CreepRefiller = require("./../Creeps/Refiller");
let CreepTypes = [CreepInital, CreepMiner, CreepHauler, CreepBuilder, CreepRefiller];

Creep.prototype.Advance = () =>
{
    if (this.ticksToLive <= DEATH_THRESHOLD)
    {
        delete Memory.creeps[this.name];
        return;
    }
    CreepTypes[this.memory.type].Advance(this);
};

Creep.prototype.Move = () =>
{

};

Creep.prototype.Harvest = () =>
{

};

Creep.prototype.Deposit = () =>
{

};

Creep.prototype.Withdraw = () =>
{

};

Creep.prototype.Build = () =>
{

};

Creep.prototype.Repair = () =>
{

};

Creep.prototype.IsFull = () => this.carry[RESOURCE_ENERGY] === this.carryCapacity;
Creep.prototype.IsEmpty = () => this.carry[RESOURCE_ENERGY] === 0;
