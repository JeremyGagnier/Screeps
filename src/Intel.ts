import { ExtensionManager } from './ExtensionManager'
import { ROOM_SIZE } from './Constants'

const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]

/**
 * Intel contains constant fundamental and derived properties which are used to evaluate the quality of the room and to
 * reduce duplicate computations such as for computing paths and finding things.
 *
 * In the future Intel will try to find an efficient configuration of the room as if it were owned and compute a score
 * based off of that. Additionally it will compute a score for each neighbouring room about its value if it were mined
 * from that room. These scores will be used by Empire to decide what rooms to expand to.
 */
export class Intel {
    // Fundamental properties
    public sourcePoss: number[] = []
    public harvestPoss: number[][] = []

    // Derived properties
    public spawnPos: number = 0
    public spawnOrientation: number = 0
    public extensionsPos1: number = 0
    public extensionsOrientation1: number = 0
    public extensionsPos2: number = 0
    public extensionsOrientation2: number = 0
    public turretsPos: number = 0
    public turretsOrientation: number = 0

    public sourcePaths: number[][][] = []
    public spawnToExtensionPaths: number[][][] = []
    public roomEdgePaths: (number[][] | undefined)[] = []


    constructor(roomName: string) {
        const room = Game.rooms[roomName]
        const sources = room.find(FIND_SOURCES)
        const sourcesLength = sources.length
        for (let sourcesIter = 0; sourcesIter < sourcesLength; ++sourcesIter) {
            const sourcePos = sources[sourcesIter].pos
            const positions = []
            for (let i in NEIGHBOURS) {
                const x = NEIGHBOURS[i][0] + sourcePos.x
                const y = NEIGHBOURS[i][1] + sourcePos.y
                if (room.lookForAt(LOOK_TERRAIN, x, y)[0] !== "wall") {
                    positions.push(x + y * ROOM_SIZE)
                }
            }
            this.sourcePoss.push(sourcePos.x + sourcePos.y * ROOM_SIZE)
            this.harvestPoss.push(positions)
        }

        const spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length === 0) {
            // TODO: Find ideal spawn position.
        } else {
            const spawn = spawns[0]
            this.spawnOrientation = parseInt(spawn.name.charAt(0)) || 0
            this.spawnPos = spawn.pos.x + spawn.pos.y * ROOM_SIZE
        }

        const extensionsPlacement = ExtensionManager.GetExtensionsPlacement(room, this.spawnPos, this.spawnOrientation)
        this.extensionsPos1 = extensionsPlacement[0]
        this.extensionsOrientation1 = extensionsPlacement[1]
    }
}
