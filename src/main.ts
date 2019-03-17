import { Empire } from "./Empire"
import { ErrorMapper } from "./utils/ErrorMapper"
import { StrategyManager } from './strategies/StrategyManager'
import { CreepManager } from './creeps/CreepManager'

export const loop: () => void = ErrorMapper.wrapLoop(() => {
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
})
