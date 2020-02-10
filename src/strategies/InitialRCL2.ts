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

    static Advance(strategy: Strategy): void {
        const room: Room = Game.rooms[strategy.roomName]
        const intel: Intel = Memory.intel[strategy.roomName]
        const spawn = Strategy.GetSpawn(strategy, room, intel)
        const harvestJobs = Strategy.GetHarvestJobs(strategy, intel)

        const stillIdleCreeps: CreepInitial[] = []
        let creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        while (creep) {
            if (CreepInitial.IsEmpty(CreepInitial.Creep(creep))) {
                stillIdleCreeps.push(creep)
            } else {
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    if (room.controller) {
                        CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + room.controller.pos.y * ROOM_SIZE)
                    }
                } else if (spawn) {
                    CreepInitial.SetHaulJob(creep, spawn.pos.x + spawn.pos.y * ROOM_SIZE)
                }
            }
            creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        }

        const shouldSpawnCreep = Strategy.AssignHarvestJobs(strategy, intel, harvestJobs, stillIdleCreeps)
        if (spawn) {
            const creepsCount = Object.keys(Game.creeps).length
            Strategy.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawn)
        }
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
