// IMPORTANT: Any structure saved to memory will not not retain its methods and references in the next loop. Do not
//            store objects that require either of these in Memory without a well organized way to resolve them.
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
