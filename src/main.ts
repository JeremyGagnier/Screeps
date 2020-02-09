require('types')
import { CreepManager } from './creeps/CreepManager'
import { Empire } from "Empire"
import { StrategyManager } from './strategies/StrategyManager'

export const loop: () => void = () => {
    if (Memory.empire === undefined) {
        Memory.empire = new Empire()
    }

    CreepManager.Advance()
    StrategyManager.Advance()
}
