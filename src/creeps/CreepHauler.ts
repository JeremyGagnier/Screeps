import { CreepBase } from './CreepBase'
import { CreepManager } from './CreepManager'
import { Intel } from '../Intel'
import { PathWalker } from './PathWalker'
import { SpawnManager } from '../SpawnManager'
import { Strategy } from '../strategies/Strategy'

export class CreepHauler extends PathWalker {

    constructor(public name: string, public roomName: string, public sourceIndex: number, public dropOffPos: [number, number]) {
        super(name)
        CreepManager.AddCreep(this)
    }

    static Advance(creep: CreepHauler): void {
        const gameCreep: Creep = Game.creeps[creep.name]
        const room: Room = Game.rooms[creep.roomName]
        const intel: Intel = Memory.intel[creep.roomName]
        if (gameCreep.fatigue <= 0) {
            const path: [number, number][] = intel.sourcePath[creep.sourceIndex]
            if (creep.forward) {
                const pathDest = path[path.length - 2]
                if (gameCreep.pos.x === pathDest[0] && gameCreep.pos.y === pathDest[1]) {
                    creep.forward = false
                    const containerPos = path[path.length - 1]
                    const structures = room.lookForAt(LOOK_STRUCTURES, containerPos[0], containerPos[1])
                    const container = structures.find(structure => structure.structureType === STRUCTURE_CONTAINER)
                    if (container) {
                        gameCreep.withdraw(container, RESOURCE_ENERGY)
                    } else {
                        console.log("Somehow a container is missing for withdrawl!")
                    }
                }
            } else {
                const pathDest = path[1]
                if (gameCreep.pos.x === pathDest[0] && gameCreep.pos.y === pathDest[1]) {
                    creep.forward = true
                    const structures = room.lookForAt(LOOK_STRUCTURES, creep.dropOffPos[0], creep.dropOffPos[1])
                    const depositable = structures.find(structure => {
                        return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE
                    })
                    if (depositable) {
                        gameCreep.transfer(depositable, RESOURCE_ENERGY)
                    } else {
                        console.log("There is no depositable at the drop-off position!")
                    }
                }
            }
            PathWalker.MoveByPath(creep, gameCreep, path)
        }
    }
}
