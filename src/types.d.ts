//import { CreepBase } from 'creeps/CreepBase'
//import { Empire } from "Empire"
//import { Intel } from "Intel"
//import { Strategy } from "strategies/Strategy"

interface Memory {
    initialCreeps: CreepInitial[]
    haulerCreeps: CreepHauler[]
    initialCreepsIndex: { [creepName: string]: number }
    haulerCreepsIndex: { [creepName: string]: number }
    //minerCreeps: CreepMiner[]
    //builderCreeps: CreepBuilder[]
    //refillerCreeps: CreepRefiller[]
    empire: Empire
    intel: { [roomName: string]: Intel }
    strategy: Strategy[]
}

declare const Memory: Memory;

function Sum(object: { [key: string]: number }): number {
    let sum: number = 0
    for (let key in object)
    {
        sum += object[key]
    }
    return sum
}
