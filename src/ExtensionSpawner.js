const POSITIONS = [
    [0, -1], [-1, 0], [0, -2], [-2, 0], [-1, -2], [-2, -1],
    [-1, -3], [-3, -1], [-2, -3], [-3, -2],
    [-4, -2], [-4, -3], [-4, -4], [-3, -4],
    [-3, -5], [-2, -5], [-1, -5],
    [0, -5], [0, -3],
    [1, -5], [1, -4],
    [1, -2] ,[2, -4], [2, -3],
    [3, -3], [3, -2], [3, -1], [2, -1],
    [2, 0], [1, 0]
];

const FILLS_BEFORE_MOVE = [6, 4, 4, 3, 2, 2, 3, 4, 2];

let ExtensionSpawner;
ExtensionSpawner =
{
    PlaceExtensions: (room, startIndex, endIndex, extensionsPos) =>
    {
        for (let iter = startIndex; iter < endIndex; ++iter)
        {
            let pos = ExtensionSpawner.GetTransformedPosition(iter, extensionsPos);
            room.createConstructionSite(pos[0], pos[1], STRUCTURE_EXTENSION);
        }
    },

    GetTransformedPosition: (posIndex, extensionsPos) =>
    {
        let pos = POSITIONS[posIndex];
        switch (extensionsPos.orientation)
        {
            // Rotating visually clockwise (actually counterclockwise), then invert in the x-axis and repeat.
            case 0: return [pos[0] + extensionsPos.x, pos[1] + extensionsPos.y];
            case 1: return [-pos[1] + extensionsPos.x, pos[0] + extensionsPos.y];
            case 2: return [-pos[0] + extensionsPos.x, -pos[1] + extensionsPos.y];
            case 3: return [pos[1] + extensionsPos.x, -pos[0] + extensionsPos.y];
            case 4: return [-pos[0] + extensionsPos.x, pos[1] + extensionsPos.y];
            case 5: return [-pos[1] + extensionsPos.x, -pos[0] + extensionsPos.y];
            case 6: return [pos[0] + extensionsPos.x, -pos[1] + extensionsPos.y];
            case 7: return [pos[1] + extensionsPos.x, pos[0] + extensionsPos.y];
        }
    }
}

module.exports = ExtensionSpawner;
