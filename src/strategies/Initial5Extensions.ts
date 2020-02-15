import { CreepInitial } from '../creeps/CreepInitial'
import { ExtensionManager } from '../ExtensionManager'
import { FirstContainer } from './FirstContainer'
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

    static WhenSpawnFull(creep: CreepInitial, room: Room, strategy: Strategy): void {
        const extensionsPos: [number, number] = ExtensionManager.GetTransformedPosition(
            strategy.builtExtensionsIndex,
            strategy.extensionsPos,
            strategy.extensionsOrientation)
        const extension: ConstructionSite | null = room.lookForAt(
            LOOK_CONSTRUCTION_SITES,
            extensionsPos[0],
            extensionsPos[1])[0]
        if (extension) {
            CreepInitial.SetBuildJob(creep, extension.pos.x + ROOM_SIZE * extension.pos.y)
        } else {
            strategy.builtExtensionsIndex += 1
            if (room.controller) {
                CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
            } else {
                console.log("Somehow this room (" + room.name + ") has no controller!")
            }
        }
    }

    static Advance(strategy: Strategy): void {
        Strategy.Advance(strategy, Initial5Extensions.WhenSpawnFull)
    }

    static FromInitial5ExtensionsToFirstContainer(strategy: Strategy): boolean {
        const shouldTransition = strategy.builtExtensionsIndex >= 5
        if (shouldTransition) {
            FirstContainer.Initialize(strategy)
        }
        return shouldTransition
    }
}
