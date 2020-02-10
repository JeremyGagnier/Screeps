import { ROOM_SIZE } from './Constants';
import { SpawnManager } from 'SpawnManager';

export class ExtensionManager {

    static readonly POSITIONS: [number, number][] = [
        [ 0, -1], [-1,  0], [ 0, -2], [-2,  0], [-1, -2], [-2, -1],
        [-3, -1], [-3, -2], [-3, -3], [-2, -3],
        [-2, -4], [-1, -4], [ 0, -3],
        [ 1, -3], [ 1, -4], [ 1, -5], [ 0, -5],
        [ 0, -6], [-1, -6], [-2, -5],
        [-3, -5], [-3, -6], [-3, -7], [-2, -7],
        [-2, -8], [-1, -7], [ 0, -6],
        [-1, -9], [ 0, -9], [ 1, -9], [ 1, -7],
        [ 2, -9], [ 2, -8],
        [ 1, -6], [ 2, -6], [ 3, -8], [ 3, -7],
        [ 2, -5], [ 3, -5], [ 4, -7], [ 4, -6],
        [ 3, -4], [ 4, -4], [ 5, -6], [ 5, -5],
        [ 6, -5], [ 6, -4], [ 6, -3], [ 4, -3],
        [ 6, -2], [ 5, -2],
        [ 3, -3], [ 3, -2], [ 5, -1], [ 4, -1],
        [ 2, -2], [ 2, -1], [ 4,  0], [ 3,  0],
        [ 1, -1]
    ]

    static readonly WALK_POSITIONS: [number, number][] = [
        [ 0, 0],
        [-1, -1],
        [-2, -2],
        [-1, -3],
        [ 0, -4],
        [-1, -5],
        [-2, -6],
        [-1, -7],
        [ 0, -8],
        [ 1, -8],
        [ 2, -7],
        [ 3, -6],
        [ 4, -5],
        [ 5, -4],
        [ 5, -3],
        [ 4, -2],
        [ 3, -1],
        [ 2, 0],
        [ 1, 0],
        [ 0, 0]
    ]

    static readonly FILLS_BEFORE_MOVE = [-1, 6, 4, 3, 4, 3, 4, 3, 4, 2, 4, 4, 4, 4, 2, 4, 4, 1, 0]

    public static PlaceExtensions(
        room: Room,
        startIndex: number,
        endIndex: number,
        pos: number,
        orientation: number): void {

        for (let iter = startIndex; iter < endIndex; ++iter) {
            const transformedPos = ExtensionManager.GetTransformedPosition(iter, pos, orientation)
            room.createConstructionSite(transformedPos[0], transformedPos[1], STRUCTURE_EXTENSION)
        }
    }

    public static GetTransformedPosition(posIndex: number, pos: number, orientation: number): [number, number] {
        const basePos = ExtensionManager.POSITIONS[posIndex]
        return ExtensionManager.TransformPos(basePos, pos, orientation)
    }

    public static GetWalkPosition(posIndex: number, pos: number, orientation: number): [number, number] {
        const basePos = ExtensionManager.WALK_POSITIONS[posIndex]
        return ExtensionManager.TransformPos(basePos, pos, orientation)
    }

    private static TransformPos(basePos: [number, number], pos: number, orientation: number): [number, number] {
        const x = pos % ROOM_SIZE
        const y = ~~(pos / ROOM_SIZE)
        switch (orientation) {
            case 0: return [basePos[0] + x, basePos[1] + y]
            case 1: return [-basePos[1] + x, basePos[0] + y]
            case 2: return [-basePos[0] + x, -basePos[1] + y]
            case 3: return [basePos[1] + x, -basePos[0] + y]
            case 4: return [-basePos[0] + x, basePos[1] + y]
            case 5: return [-basePos[1] + x, -basePos[0] + y]
            case 6: return [basePos[0] + x, -basePos[1] + y]
            case 7: return [basePos[1] + x, basePos[0] + y]
            default: throw new Error("Extensions orientation was invalid")
        }
    }

    // Blocked positions are only from 6 to 44 (instead of 0 to 50) so we need to subtract from the real position to
    // get the right index.
    private static IsValidPosition(blockedPositions: boolean[], pos: number, orientation: number): boolean {
        const positionsLength = ExtensionManager.POSITIONS.length
        for (let iter = 0; iter < positionsLength; ++iter) {
            const transformedPos = ExtensionManager.GetTransformedPosition(iter, pos, orientation)
            const blockedPos = transformedPos[0] - 6 + (transformedPos[1] - 6) * (ROOM_SIZE - 12)
            if (blockedPos > 0 && blockedPositions[blockedPos]) {
                return false
            }
        }
        const walkPositionsLength = ExtensionManager.WALK_POSITIONS.length
        for (let iter = 0; iter < walkPositionsLength; ++iter) {
            const transformedPos = ExtensionManager.GetWalkPosition(iter, pos, orientation)
            const blockedPos = transformedPos[0] - 6 + (transformedPos[1] - 6) * (ROOM_SIZE - 12)
            if (blockedPos > 0 && blockedPositions[blockedPos]) {
                return false
            }
        }
        return true
    }

    public static GetExtensionsPlacement(room: Room, spawnPos: number, spawnOrientation: number): [number, number] {
        const blockedPositions: boolean[] = []
        const checkedPositions: boolean[] = []
        for (let y = 6; y < ROOM_SIZE - 6; ++y) {
            for (let x = 6; x < ROOM_SIZE - 6; ++x) {
                const terrain = room.lookForAt(LOOK_TERRAIN, x, y)
                const structures = room.lookForAt(LOOK_STRUCTURES, x, y)
                if (terrain.find(t => t === "wall") ||
                    structures.find(s => s instanceof StructureSpawn || s instanceof StructureController)) {
                    blockedPositions.push(true)
                } else {
                    blockedPositions.push(false)
                }
                checkedPositions.push(false)
            }
        }
        const spawnBlocked = SpawnManager.GetBlockedPositions(spawnPos, spawnOrientation)
        const spawnBlockedLength = spawnBlocked.length
        for (let spawnBlockedIter = 0; spawnBlockedIter < spawnBlockedLength; ++spawnBlockedIter) {
            const blockedPos = spawnBlocked[spawnBlockedIter]
            const y = ~~(blockedPos / ROOM_SIZE)
            const blockedIndex = blockedPos - 6 * (2 * y + ROOM_SIZE - 11)
            if (blockedIndex >= 0) {
                blockedPositions[blockedIndex] = true
            }
        }

        let bestPos = -1
        let bestOrientation = -1
        let bestDistance = 50
        let numOfIterations = 0
        while (true) {
            const randomPos = [~~(Math.random() * (ROOM_SIZE - 12)) + 6, ~~(Math.random() * (ROOM_SIZE - 12)) + 6]
            const checkPos = randomPos[0] - 6 + (randomPos[1] - 6) * (ROOM_SIZE - 12)
            if (checkedPositions[checkPos]) {
                continue
            }
            checkedPositions[checkPos] = true
            const dx = (spawnPos % ROOM_SIZE) - randomPos[0]
            const dy = ~~(spawnPos / ROOM_SIZE) - randomPos[1]
            // The orientation is defined so that it's facing the spawn and therefore as close as possible.
            let orientation
            if (Math.abs(dx) > Math.abs(dy)) {
                orientation = (dx < 0) ? 3 : 1
            } else {
                orientation = (dy < 0) ? 2 : 0
            }
            // The origin of the extensions is not in the middle, so adjust accordingly
            let adjustedPos
            switch (orientation) {
                case 0:
                    adjustedPos = randomPos[0] + (randomPos[1] + 5) * ROOM_SIZE
                    break
                case 1:
                    adjustedPos = randomPos[0] + 5 + randomPos[0] * ROOM_SIZE
                    break
                case 2:
                    adjustedPos = randomPos[0] + (randomPos[1] - 5) * ROOM_SIZE
                    break
                case 3:
                    adjustedPos = randomPos[0] - 5 + randomPos[1] * ROOM_SIZE
                    break
                default:
                    throw new Error()
            }
            if (ExtensionManager.IsValidPosition(blockedPositions, adjustedPos, orientation)) {
                const distance = Math.max(Math.abs(dx), Math.abs(dy))
                if (distance < bestDistance) {
                    bestDistance = distance
                    bestPos = adjustedPos
                    bestOrientation = orientation
                }
            }
            // Break if our best distance is "good enough" for how many times we've iterated or if we've checked half
            // of all possible locations.
            if ((bestPos > 0 && numOfIterations > bestDistance * 16) ||
                numOfIterations > (ROOM_SIZE - 12) * (ROOM_SIZE - 12) / 2) {
                console.log("Found extension position after " + numOfIterations + " iterations.")
                break
            }
            numOfIterations += 1
        }
        if (bestPos < 0) {
            throw new Error("Failed to get extensions placement after checking half the squares in the room")
        }
        return [bestPos, bestOrientation]
    }
}
