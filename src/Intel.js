const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

let Intel;
Intel =
{
    Initialize: () =>
    {
        Memory.intel = {};
        Intel.ScanRoom(Object.values(Game.rooms)[0]);
    },

    ScanRoom: (room) =>
    {
        let sourcePositions = [];
        let harvestPositions = [];
        let harvesters = [];

        let sources = room.find(FIND_SOURCES);
        for (let sourceIter in sources)
        {
            let sourcePos = sources[sourceIter].pos;
            let positions = [];
            let nulls = [];
            for (let iter in NEIGHBOURS)
            {
                let x = NEIGHBOURS[iter][0] + sourcePos.x;
                let y = NEIGHBOURS[iter][1] + sourcePos.y;
                if (room.lookForAt(LOOK_TERRAIN, x, y).toString() !== "wall")
                {
                    positions.push(x + ROOM_SIZE * y);
                    nulls.push(null);
                }
            }
            sourcePositions.push(sourcePos.x + ROOM_SIZE * sourcePos.y);
            harvestPositions.push(positions);
            harvesters.push(nulls);
        }

        let spawner = room.find(FIND_MY_SPAWNS)[0]
        Memory.intel[room.name] =
        {
            spawnerPos: spawner.pos.x + ROOM_SIZE * spawner.pos.y,
            sourcePositions: sourcePositions,
            harvestPositions: harvestPositions,
            harvesters: harvesters
        };
    }
}

module.exports = Intel;
