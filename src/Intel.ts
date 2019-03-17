import { ROOM_SIZE } from './Constants'

const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]

export class Intel {

    public sourcePoss: number[] = []
    public harvestPoss: number[][] = []

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
    }
}
