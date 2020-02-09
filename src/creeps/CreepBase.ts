import { ROOM_SIZE, Sum } from 'Constants';

export abstract class CreepBase {

    constructor(public name: string) {}

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
