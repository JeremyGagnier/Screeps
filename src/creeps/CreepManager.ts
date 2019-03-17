import { CreepBase } from './CreepBase'
import { CreepData } from './CreepData'
import { CreepInitial } from './CreepInitial'
import { CreepType } from './CreepType'

export class CreepManager {

    static Advance(): void {
        const creepNames: string[] = Object.keys(Game.creeps)
        const creepNamesLength = creepNames.length
        for (let creepNamesIter = 0; creepNamesIter < creepNamesLength; ++creepNamesIter) {
            const creepName = creepNames[creepNamesIter]
            const creepData: CreepData = Memory.c[creepName].data
            let creep: CreepBase | undefined
            switch (creepData.type) {
                case CreepType.INITIAL:
                    creep = new CreepInitial(creepData)
                    break
                case CreepType.REFILLER:
                    // TODO
                    break
                case CreepType.HAULER:
                    // TODO
                    break
                case CreepType.MINER:
                    // TODO
                    break
                case CreepType.BUILDER:
                    // TODO
                    break
                default:
                    console.log(Object.keys(creepData).toString() + " --- " + Object.values(creepData).toString())
                    console.log("Tried to advance unimplemented creep type: " + creepData.type)
                    break
            }
            if (creep) {
                Memory.c[creepName] = creep
                creep.Advance(Game.creeps[creepName])
            }
        }
    }
}
