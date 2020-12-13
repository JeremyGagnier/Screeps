import { EmpireState } from "./EmpireState"


export function IsInitialized() {
    return Memory.creepIndex
}

export function Init() {
    const roomNames = Object.keys(Game.rooms)
    if (roomNames.length === 0) {
        throw Error("Waiting until a room is claimed.")
    }
    const roomName = roomNames[0]
    if (roomName === "sim" && Game.rooms[roomName].find(FIND_MY_SPAWNS).length === 0) {
        throw Error("Waiting until simulation room is set up.")
    }
    const strategy: Strategy = new Strategy(StrategyType.INITIAL_RCL_2, roomName)
    Memory.initialCreeps = []
    Memory.haulerCreeps = []
    Memory.initialCreepsIndex = {}
    Memory.haulerCreepsIndex = {}
    Memory.strategy = [strategy]
    Memory.intel = {[roomName]: new Intel(roomName)}

    InitialRCL2.Initialize(strategy)
}



export class Empire {
    public creepCount: number = 0
    empireState: EmpireState = EmpireState.STATE_INITIAL

    constructor() {
        const roomNames = Object.keys(Game.rooms)
        if (roomNames.length === 0) {
            throw Error("Waiting until a room is claimed.")
        }
        const roomName = roomNames[0]
        if (roomName === "sim" && Game.rooms[roomName].find(FIND_MY_SPAWNS).length === 0) {
            throw Error("Waiting until simulation room is set up.")
        }
        const strategy: Strategy = new Strategy(StrategyType.INITIAL_RCL_2, roomName)
        Memory.initialCreeps = []
        Memory.haulerCreeps = []
        Memory.initialCreepsIndex = {}
        Memory.haulerCreepsIndex = {}
        Memory.strategy = [strategy]
        Memory.intel = {[roomName]: new Intel(roomName)}

        InitialRCL2.Initialize(strategy)
    }
}