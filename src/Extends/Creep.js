let CreepInital = require("Creeps.Initial");
let CreepMiner = require("Creeps.Miner");
let CreepHauler = require("Creeps.Hauler");
let CreepBuilder = require("Creeps.Builder");
let CreepRefiller = require("Creeps.Refiller");
let CreepTypes = [CreepInital, CreepMiner, CreepHauler, CreepBuilder, CreepRefiller];

Creep.prototype.Advance = function()
{
    if (this.spawning)
    {
        return;
    }

    if (this.memory.new)
    {
        this.memory.new = false;
        Memory.strategy.idleCreeps.push(this.name);
        CreepTypes[this.memory.type].Setup(this);
    }
    else if (this.ticksToLive <= 0)
    {
        return;
    }
    
    CreepTypes[this.memory.type].Advance(this);
};

Creep.prototype.SetHarvestJob = function(harvestPos, sourcePos)
{
    CreepTypes[this.memory.type].SetHarvestJob(this, harvestPos, sourcePos);
}

Creep.prototype.SetDepositJob = function(depositPos, adjacentDist)
{
    CreepTypes[this.memory.type].SetDepositJob(this, depositPos, adjacentDist);
}

Creep.prototype.SetBuildJob = function(getEnergyPos, buildPos)
{
    CreepTypes[this.memory.type].SetBuildJob(this, getEnergyPos, buildPos);
}

Creep.prototype.Move = function()
{
    let pos = this.memory.targetPos;
    return this.moveTo(pos % ROOM_SIZE, ~~(pos / ROOM_SIZE), {reusePath: 3});
};

Creep.prototype.Harvest = function()
{
    let pos = this.memory.targetPos;
    let sources = this.room.lookForAt(LOOK_SOURCES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE));
    return sources[0] && this.harvest(sources[0]);
};

Creep.prototype.Deposit = function()
{
    let pos = this.memory.targetPos;
    let structures = this.room.lookForAt(LOOK_STRUCTURES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE));
    return structures[0] && this.transfer(structures[0], RESOURCE_ENERGY);
};

Creep.prototype.Withdraw = function()
{
    let pos = this.memory.targetPos;
    let structures = this.room.lookForAt(LOOK_STRUCTURES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE));
    return structures[0] && this.withdraw(structures[0], RESOURCE_ENERGY);
};

Creep.prototype.Build = function()
{
    let pos = this.memory.targetPos;
    let structures = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE));
    return structures[0] && this.build(structures[0]);
};

Creep.prototype.Repair = function()
{
    let pos = this.memory.targetPos;
    let structures = this.room.lookForAt(LOOK_STRUCTURES, pos % ROOM_SIZE, ~~(pos / ROOM_SIZE));
    return structures[0] && this.repair(structures[0]);
};

Creep.prototype.IsFull = function()
{
    return this.carry[RESOURCE_ENERGY] === this.carryCapacity;
}

Creep.prototype.IsEmpty = function()
{
    return this.carry[RESOURCE_ENERGY] === 0;
}

Creep.prototype.DistanceToTarget = function()
{
    return Math.max(
        Math.abs(this.pos.x - this.memory.targetPos % ROOM_SIZE),
        Math.abs(this.pos.y - ~~(this.memory.targetPos / ROOM_SIZE)));
}
