import { StrategyData } from 'strategies/Strategy'
import { ROOM_SIZE } from 'Constants';
import { CreepData } from './CreepData';

export abstract class CreepBase {

    constructor(public data: CreepData) {}

    abstract Advance(creep: Creep): void

    Idle() {
        const strategiesLength = Memory.strategy.length
        const roomName = Game.creeps[this.data.name].room.name
        for (let strategiesIter = 0; strategiesIter < strategiesLength; ++strategiesIter) {
            const strategyData: StrategyData = Memory.strategy[strategiesIter]
            if (strategyData.roomName === roomName) {
                strategyData.idleCreeps.push(this)
                return
            }
        }
    }

    IsFull(creep: Creep) {
        return _.sum(creep.carry) === creep.carryCapacity
    }

    IsEmpty(creep: Creep) {
        return _.sum(creep.carry) === 0
    }

    DistanceToTarget(creep: Creep, target: number) {
        return Math.max(
            Math.abs(creep.pos.x - target % ROOM_SIZE),
            Math.abs(creep.pos.y - ~~(target / ROOM_SIZE))
        )
    }
}
