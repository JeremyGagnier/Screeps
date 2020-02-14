import { CreepInitial } from '../creeps/CreepInitial'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'
import { Strategy } from './Strategy'

export class InitialStrategy {
    static Advance(
        strategy: Strategy,
        whenSpawnFull: (creep: CreepInitial, room: Room, strategy: Strategy) => void): void {
        
        const room: Room = Game.rooms[strategy.roomName]
        const intel: Intel = Memory.intel[strategy.roomName]
        const spawn = Strategy.GetSpawn(strategy, room)
        const harvestJobs = Strategy.GetHarvestJobs(strategy, intel)

        const stillIdleCreeps: CreepInitial[] = []
        let creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        while (creep) {
            if (CreepInitial.IsEmpty(CreepInitial.Creep(creep))) {
                stillIdleCreeps.push(creep)
            } else {
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    whenSpawnFull(creep, room, strategy)
                } else if (spawn) {
                    CreepInitial.SetHaulJob(creep, spawn.pos.x + spawn.pos.y * ROOM_SIZE)
                } else {
                    console.log("Somehow this room (" + room.name + ") has no spawn!")
                }
            }
            creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        }

        const shouldSpawnCreep = Strategy.AssignHarvestJobs(strategy, intel, harvestJobs, stillIdleCreeps)
        if (spawn) {
            const creepsCount = Object.keys(Game.creeps).length
            Strategy.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawn)
        }
    }
}