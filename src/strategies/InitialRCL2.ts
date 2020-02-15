import { CreepInitial } from '../creeps/CreepInitial'
import { Initial5Extensions } from './Initial5Extensions'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'
import { Strategy } from './Strategy'

export class InitialRCL2 {
    
    static Initialize(strategy: Strategy) {
        const intel: Intel = Memory.intel[strategy.roomName]
        const sourcePossLength = intel.sourcePoss.length
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            const nulls = []
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                nulls.push(null)
            }
            strategy.initialHarvesters.push(nulls)
        }
    }

    static WhenSpawnFull(creep: CreepInitial, room: Room, strategy: Strategy): void {
        if (room.controller) {
            CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + room.controller.pos.y * ROOM_SIZE)
        } else {
            console.log("Somehow this room (" + room.name + ") has no controller!")
        }
    }

    static Advance(strategy: Strategy): void {
        Strategy.Advance(strategy, InitialRCL2.WhenSpawnFull)
    }

    static FromInitialRcl2ToInitial5Extensions(strategy: Strategy): boolean {
        const controller = Game.rooms[strategy.roomName].controller
        if (controller) {
            const shouldTransition = controller.level >= 2
            if (shouldTransition) {
                Initial5Extensions.Initialize(strategy)
            }
            return shouldTransition
        }
        return false
    }
}
