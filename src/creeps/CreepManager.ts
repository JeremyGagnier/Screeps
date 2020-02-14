import { CreepBase } from './CreepBase'
import { CreepHauler } from './CreepHauler'
import { CreepInitial } from './CreepInitial'

export class CreepManager {

    static AddCreep(creep: CreepBase): void {
        if (creep instanceof CreepInitial) {
            const newLength: number = Memory.initialCreeps.push(creep)
            Memory.initialCreepsIndex[creep.name] = newLength - 1
        } else if (creep instanceof CreepHauler) {
            const newLength: number = Memory.haulerCreeps.push(creep)
            Memory.haulerCreepsIndex[creep.name] = newLength - 1
        } else {
            throw new Error("A creep type is not implemented in CreepManager.AddCreep")
        }
    }

    // Method that gets any creep type by name.
    static GetCreep(name: string): CreepBase | undefined {
        if (name in Memory.initialCreepsIndex) {
            return Memory.initialCreeps[Memory.initialCreepsIndex[name]]
        } else if (name in Memory.haulerCreepsIndex) {
            return Memory.haulerCreeps[Memory.haulerCreepsIndex[name]]
        } else {
            throw new Error("A creep type is not implemented in CreepManager.GetCreep")
        }
    }

    static GetCreepInitial(name: string): CreepInitial {
        return Memory.initialCreeps[Memory.initialCreepsIndex[name]]
    }

    static GetCreepHauler(name: string): CreepHauler {
        return Memory.haulerCreeps[Memory.haulerCreepsIndex[name]]
    }

    static Advance(): void {
        const creepNames: string[] = Object.keys(Game.creeps)

        // Initial Creeps
        const initialCreepsLength = Memory.initialCreeps.length
        let deletedCount: number = 0;
        for (let creepIter = 0; creepIter < initialCreepsLength; ++creepIter) {
            let creep = Memory.initialCreeps[creepIter]
            if (creepNames.includes(creep.name)) {
                Memory.initialCreeps[creepIter - deletedCount] = creep
                Memory.initialCreepsIndex[creep.name] -= deletedCount
                CreepInitial.Advance(creep)
            } else {
                deletedCount += 1
                delete Memory.creeps[creep.name]
                delete Memory.initialCreepsIndex[creep.name]
            }
        }
        Memory.initialCreeps.length -= deletedCount

        // Hauler Creeps
        const haulerCreepsLength = Memory.haulerCreeps.length
        deletedCount = 0;
        for (let creepIter = 0; creepIter < haulerCreepsLength; ++creepIter) {
            let creep = Memory.haulerCreeps[creepIter]
            if (creepNames.includes(creep.name)) {
                Memory.haulerCreeps[creepIter - deletedCount] = creep
                CreepHauler.Advance(creep)
            } else {
                deletedCount += 1
                delete Memory.creeps[creep.name]
                delete Memory.haulerCreepsIndex[creep.name]
            }
        }
        Memory.haulerCreeps.length -= deletedCount
    }
}
