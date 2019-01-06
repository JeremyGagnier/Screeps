const CreepInital = require("Creeps.Initial");
const CreepMiner = require("Creeps.Miner");
const CreepHauler = require("Creeps.Hauler");
const CreepBuilder = require("Creeps.Builder");
const CreepRefiller = require("Creeps.Refiller");
const CreepTypes = [CreepInital, CreepMiner, CreepHauler, CreepBuilder, CreepRefiller];

Creep.prototype.Advance = function()
{
    if (this.spawning)
    {
        return;
    }

    if (this.memory.new)
    {
        this.memory.new = false;
        Memory.strategy.creepCount += 1;
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
};

Creep.prototype.SetDepositJob = function(depositPos, adjacentDist)
{
    CreepTypes[this.memory.type].SetDepositJob(this, depositPos, adjacentDist);
};

Creep.prototype.SetBuildJob = function(getEnergyPos, buildPos)
{
    CreepTypes[this.memory.type].SetBuildJob(this, getEnergyPos, buildPos);
};

Creep.prototype.SetDieJob = function(diePos)
{
    CreepTypes[this.memory.type].SetDieJob(this, diePos);
};

Creep.prototype.Move = function()
{
    let pos = this.memory.targetPos;
    return this.moveTo(pos % ROOM_SIZE, ~~(pos / ROOM_SIZE), {reusePath: 3});
};

Creep.prototype.MoveByPath = function(forward = true)
{
    let currentPos = this.pos.x + this.pos.y * ROOM_SIZE;
    if (currentPos !== this.memory.lastPos)
    {
        if (forward)
        {
            this.memory.walkIndex += 1;
        }
        else
        {
            this.memory.walkIndex -= 1;
        }
        this.memory.lastPos = currentPos;
    }
    let to = this.memory.path[this.memory.walkIndex];
    // Only walk if there's more path
    if (to)
    {
        let direction = DIRECTIONS[to[1] - this.pos.y + 1][to[0] - this.pos.x + 1];
        if (direction)
        {
            this.move(direction);
        }
        else
        {
            console.log("Creep " + this.name + " was not adjacent to its next path position");
        }
    }
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
};

Creep.prototype.IsEmpty = function()
{
    return this.carry[RESOURCE_ENERGY] === 0;
};

Creep.prototype.DistanceToTarget = function()
{
    return Math.max(
        Math.abs(this.pos.x - this.memory.targetPos % ROOM_SIZE),
        Math.abs(this.pos.y - ~~(this.memory.targetPos / ROOM_SIZE)));
};
