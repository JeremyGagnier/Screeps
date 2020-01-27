require('types')
import { CreepManager } from './creeps/CreepManager'
import { Empire } from "Empire"
import { StrategyManager } from './strategies/StrategyManager'

export const loop: () => void = () => {
    if (Memory.empire === undefined) {
        Memory.empire = new Empire()
    }

    if ((Game.time % CREEP_LIFE_TIME) === 0) {
        const cNames = Object.keys(Memory.c)
        for (let name in cNames) {
          if (!(name in Game.creeps)) {
            delete Memory.c[name]
          }
        }
    }

    CreepManager.Advance()
    StrategyManager.Advance()
}
