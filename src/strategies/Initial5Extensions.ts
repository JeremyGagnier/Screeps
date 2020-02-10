import { CreepInitial } from '../creeps/CreepInitial'
import { ExtensionManager } from '../ExtensionManager'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'
import { Strategy } from './Strategy'

export class Initial5Extensions {
    static Initialize(strategy: Strategy): void {
        ExtensionManager.PlaceExtensions(
            Game.rooms[strategy.roomName],
            0,
            5,
            strategy.extensionsPos,
            strategy.extensionsOrientation)
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
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    const extensionsPos: [number, number] = ExtensionManager.GetTransformedPosition(
                        strategy.builtExtensionsIndex,
                        strategy.extensionsPos,
                        strategy.extensionsOrientation)
                    // TODO: Use more robust lookForAt
                    const extension = room.lookForAt(LOOK_CONSTRUCTION_SITES, extensionsPos[0], extensionsPos[1])[0]
                    if (extension) {
                        CreepInitial.SetBuildJob(creep, extension.pos.x + ROOM_SIZE * extension.pos.y)
                    } else {
                        strategy.builtExtensionsIndex += 1
                        if (room.controller) {
                            CreepInitial.SetHaulJob(creep, room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
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

    static FromInitial5ExtensionsToFirstContainer(strategy: Strategy): boolean {
        return false
    }
}
