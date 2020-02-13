import { CreepInitial } from '../creeps/CreepInitial'
import { ExtensionManager } from '../ExtensionManager'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'
import { Strategy } from './Strategy'
import { SpawnManager } from '../SpawnManager'

export class FirstContainer {
    static Initialize(strategy: Strategy): void {
        const room = Game.rooms[strategy.roomName]
        const harvestPoss: number[][] = Memory.intel[strategy.roomName].harvestPoss
        // Put the container where the link will be. It will be replaced once the storage is set up.
        const containerPos = SpawnManager.GetLinkPosition(strategy.spawnPos, strategy.spawnOrientation)
        room.createConstructionSite(containerPos % ROOM_SIZE, ~~(containerPos / ROOM_SIZE), STRUCTURE_CONTAINER)

        for (let posIter in harvestPoss) {
            let pos = harvestPoss[posIter][0]
            room.createConstructionSite(pos % ROOM_SIZE, ~~(pos / ROOM_SIZE), STRUCTURE_CONTAINER)
        }
    }

    static Advance(strategy: Strategy): void {
        const room: Room = Game.rooms[strategy.roomName]
        const intel: Intel = Memory.intel[strategy.roomName]
        const spawn = Strategy.GetSpawn(strategy, room, intel)
        const harvestJobs = Strategy.GetHarvestJobs(strategy, intel)


        const stillIdleCreeps: CreepInitial[] = []
        let creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        while (creep) {
            if (CreepInitial.IsEmpty(CreepInitial.Creep(creep))) {
                stillIdleCreeps.push(creep)
            } else {
                const containerPos = SpawnManager.GetLinkPosition(strategy.spawnPos, strategy.spawnOrientation)
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    const construction: ConstructionSite | null = room.lookForAt(
                        LOOK_CONSTRUCTION_SITES,
                        containerPos % ROOM_SIZE,
                        ~~(containerPos / ROOM_SIZE))[0]
                    if (construction) {
                        CreepInitial.SetBuildJob(creep, containerPos)
                    } else {
                        if (room.controller) {
                            CreepInitial.SetUpgradeJob(
                                creep,
                                room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
                        } else {
                            console.log("Somehow this room (" + room.name + ") has no controller!")
                        }
                    }
                } else if (spawn) {
                    CreepInitial.SetHaulJob(creep, spawn.pos.x + ROOM_SIZE * spawn.pos.y)
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
