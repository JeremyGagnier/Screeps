import { ContainerPerSource } from './ContainerPerSource'
import { CreepInitial } from '../creeps/CreepInitial'
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

    static WhenSpawnFull(creep: CreepInitial, room: Room, strategy: Strategy): void {
        const containerPos = SpawnManager.GetLinkPosition(strategy.spawnPos, strategy.spawnOrientation)
        const construction: ConstructionSite | null = room.lookForAt(
            LOOK_CONSTRUCTION_SITES,
            containerPos % ROOM_SIZE,
            ~~(containerPos / ROOM_SIZE))[0]
        if (construction) {
            CreepInitial.SetBuildJob(creep, containerPos)
        } else {
            if (room.controller) {
                CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
            } else {
                console.log("Somehow this room (" + room.name + ") has no controller!")
            }
        }
    }

    static Advance(strategy: Strategy): void {
        Strategy.Advance(strategy, FirstContainer.WhenSpawnFull)
    }

    static FromFirstContainerToContainerPerSource(strategy: Strategy): boolean {
        const room = Game.rooms[strategy.roomName]
        const containerPos = SpawnManager.GetLinkPosition(strategy.spawnPos, strategy.spawnOrientation)
        const shouldTransition = room.lookForAt(
            LOOK_STRUCTURES,
            containerPos % ROOM_SIZE,
            ~~(containerPos / ROOM_SIZE))[0] instanceof StructureContainer
        if (shouldTransition) {
            ContainerPerSource.Initialize(strategy)
        }
        return shouldTransition
    }
}
