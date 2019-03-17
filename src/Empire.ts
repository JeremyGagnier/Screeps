import { InitialRCL2 } from "strategies/InitialRCL2";
import { StrategyType, StrategyData } from './strategies/Strategy';
import { Intel } from "Intel";

export enum EmpireState {
    STATE_INITIAL,
    STATE_ESTABLISHED
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
        const strategyData: StrategyData = new StrategyData(StrategyType.INITIAL_RCL_2, roomName)
        Memory.c = {}
        Memory.strategy = [strategyData]
        Memory.intel = {[roomName]: new Intel(roomName)}

        InitialRCL2.Initialize(strategyData)
    }
}
