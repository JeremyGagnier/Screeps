import { StrategyData } from 'strategies/Strategy'
import { ROOM_SIZE } from 'Constants';

export abstract class CreepBase {

    constructor(public name: string) {}

    static Idle(creep: CreepBase) {
        const strategiesLength = Memory.strategy.length
        const roomName = Game.creeps[this.name].room.name
        for (let strategiesIter = 0; strategiesIter < strategiesLength; ++strategiesIter) {
            const strategyData: StrategyData = Memory.strategy[strategiesIter]
            if (strategyData.roomName === roomName) {
                strategyData.idleCreeps.push(this)
                return
            }
        }
    }

    static IsFull(creep: Creep) {
        return Sum(creep.carry) === creep.carryCapacity
    }

    static IsEmpty(creep: Creep) {
        return Sum(creep.carry) === 0
    }

    static DistanceToTarget(creep: Creep, target: number) {
        return Math.max(
            Math.abs(creep.pos.x - target % ROOM_SIZE),
            Math.abs(creep.pos.y - ~~(target / ROOM_SIZE))
        )
    }
}
