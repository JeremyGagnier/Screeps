import { CreepBase } from './CreepBase'
import { DIRECTIONS, ROOM_SIZE, Sum } from '../Constants'

export class PathWalker extends CreepBase {

    public forward: boolean = true
    private lastPos: number = -1
    private walkIndex: number = 0

    static MoveByPath(creep: PathWalker, gameCreep: Creep, path: [number, number][]) {
        const currentPos = gameCreep.pos.x + gameCreep.pos.y * ROOM_SIZE
        if (currentPos !== creep.lastPos) {
            if (creep.forward) {
                creep.walkIndex += 1
            } else {
                creep.walkIndex -= 1
            }
            creep.lastPos = currentPos
        }
        const to: [number, number] = path[creep.walkIndex]
        if (to) {
            const direction: DirectionConstant | undefined =
                DIRECTIONS[to[1] - gameCreep.pos.y][to[0] - gameCreep.pos.x]
            if (direction) {
                gameCreep.move(direction)
            } else {
                console.log("Incorrect direction")
            }
        } else {
            console.log("Walk index out of path bounds")
        }
    }

    static IsAtPathDestination(creep: PathWalker, gameCreep: Creep, path: [number, number][]) {
        let pathPos: [number, number]
        if (creep.forward) {
            pathPos = path[path.length - 1]
        } else {
            pathPos = path[0]
        }
        return gameCreep.pos.x == pathPos[0] && gameCreep.pos.y == pathPos[1]
    }
}