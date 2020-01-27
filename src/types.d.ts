//import { CreepBase } from 'creeps/CreepBase'
//import { Empire } from "Empire"
//import { Intel } from "Intel"
//import { Strategy } from "strategies/Strategy"

interface Memory {
    c: { [creepName: string]: CreepBase }
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
