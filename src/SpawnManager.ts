import { ROOM_SIZE } from './Constants';
/**
 * Room spawns take up a 3x3 area because they create a creep with only carry parts to efficiently move resources
 * between several key structures. Orientations start in the +y direction for spawning and go visually clockwise.
 */
export class SpawnManager {

    public static GetSpawnDirection(orientation: number): DirectionConstant[] {
        switch (orientation) {
            case 0: return [BOTTOM]
            case 1: return [LEFT]
            case 2: return [TOP]
            case 3: return [RIGHT]
            default: throw new Error()
        }
    }

    public static GetRoadPosition(pos: number, orientation: number): number {
        switch (orientation) {
            case 0: return pos + ROOM_SIZE
            case 1: return pos - 1
            case 2: return pos - ROOM_SIZE
            case 3: return pos + 1
            default: throw new Error()
        }
    }

    public static GetBlockedPositions(pos: number, orientation: number): number[] {
        switch (orientation) {
            case 0:
                pos -= ROOM_SIZE
                break
            case 1:
                pos += 1
                break
            case 2:
                pos += ROOM_SIZE
                break
            case 3:
                pos -= 1
                break
        }
        return [
            pos - 1 - ROOM_SIZE,
            pos - ROOM_SIZE,
            pos + 1 - ROOM_SIZE,
            pos - 1,
            pos,
            pos + 1,
            pos - 1 + ROOM_SIZE,
            pos + ROOM_SIZE,
            pos + 1 + ROOM_SIZE
        ]
    }
}
