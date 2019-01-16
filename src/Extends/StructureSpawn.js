const SpawnManager = require('SpawnManager')

StructureSpawn.prototype.IsFull = function () {
  return this.energy === this.energyCapacity
}

StructureSpawn.prototype.CanSpawn = function (body) {
  let creepName = Memory.strategy.creepCount.toString()
  return this.spawnCreep(body, creepName, { dryRun: true }) === OK
}

StructureSpawn.prototype.Spawn = function (body, creepType) {
  let roomIntel = Memory.intel[this.room.name]
  let params = {
    memory: { new: true, type: creepType },
    directions: SpawnManager.GetSpawnDirection(roomIntel.spawnerPos)
  }
  let creepName = Memory.strategy.creepCount.toString()
  return this.spawnCreep(body, creepName, params)
}

StructureSpawn.prototype.TrySpawn = function (body, creepType) {
  if (this.CanSpawn(body)) {
    this.Spawn(body, creepType)
  }
}
