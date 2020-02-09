import { CreepBase } from './CreepBase'
import { CreepHauler } from './CreepHauler'
import { CreepInitial } from './CreepInitial'

export class CreepManager {

    static CleanCreepArray(
        creepNames: string[],
        creepArray: CreepBase[],
        creepIndex: { [name: string]: number }): void {

        const initialCreepsLength = creepArray.length
        let deletedCount: number = 0;
        for (let creepIter = 0; creepIter < initialCreepsLength; ++creepIter) {
            let creep: CreepBase = creepArray[creepIter]
            if (creepNames.includes(creep.name) === undefined) {
                deletedCount += 1
                delete creepIndex[creep.name]
            } else {
                Memory.initialCreeps[creepIter - deletedCount] = creep
            }
        }
        Memory.initialCreeps.length -= deletedCount
    }

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

        CreepManager.CleanCreepArray(creepNames, Memory.initialCreeps, Memory.initialCreepsIndex)
        CreepManager.CleanCreepArray(creepNames, Memory.haulerCreeps, Memory.haulerCreepsIndex)

        const initialCreepsLength = Memory.initialCreeps.length
        for (let initialCreepsIter = 0; initialCreepsIter < initialCreepsLength; ++initialCreepsIter) {
            CreepInitial.Advance(Memory.initialCreeps[initialCreepsIter])
        }
    }
}
