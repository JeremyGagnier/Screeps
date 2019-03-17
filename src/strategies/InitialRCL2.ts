import { Strategy, StrategyData } from './Strategy';
import { Intel } from 'Intel';
import { CreepInitial } from '../creeps/CreepInitial';
import { ROOM_SIZE } from '../Constants';

export class InitialRCL2 {

    static Initialize(data: StrategyData) {
        const intel: Intel = Memory.intel[data.roomName]
        const sourcePossLength = intel.sourcePoss.length
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            const nulls = []
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                nulls.push(null)
            }
            data.initialHarvesters.push(nulls)
        }
    }

    static Advance(data: StrategyData): void {
        const room: Room = Game.rooms[data.roomName]
        const intel: Intel = Memory.intel[data.roomName]
        const spawn = Strategy.GetSpawn(data, room, intel)
        const harvestJobs = Strategy.GetHarvestJobs(data, intel)

        const stillIdleCreeps: CreepInitial[] = []
        let maybeCreep = data.idleCreeps.pop() as CreepInitial | undefined
        while (maybeCreep) {
            const creep = Game.creeps[maybeCreep.data.name]
            if (maybeCreep.IsEmpty(creep)) {
                stillIdleCreeps.push(maybeCreep)
            } else {
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    if (room.controller) {
                        maybeCreep.SetUpgradeJob(room.controller.pos.x + room.controller.pos.y * ROOM_SIZE)
                    }
                } else if (spawn) {
                    maybeCreep.SetHaulJob(spawn.pos.x + spawn.pos.y * ROOM_SIZE)
                }
            }
            maybeCreep = data.idleCreeps.pop() as CreepInitial | undefined
        }

        const shouldSpawnCreep = Strategy.AssignHarvestJobs(data, intel, harvestJobs, stillIdleCreeps)
        if (spawn) {
            const creepsCount = Object.keys(Game.creeps).length
            Strategy.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawn)
        }
    }

    static FromInitialRcl2ToInitial5Extensions(data: StrategyData): boolean {
        return false
    }
}
