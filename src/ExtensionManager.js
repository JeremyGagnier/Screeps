let ExtensionManager;
ExtensionManager =
{
    POSITIONS: [
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
    ],

    WALK_POSITIONS: [
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
        [ 2,  0],
        [ 1,  0],
        [ 0,  0]
    ],

    FILLS_BEFORE_MOVE: [6, 4, 3, 4, 3, 4, 3, 4, 2, 4, 4, 4, 4, 2, 4, 4, 1, 0, 0],

    PlaceExtensions: (room, startIndex, endIndex, extensionsPos) =>
    {
        for (let iter = startIndex; iter < endIndex; ++iter)
        {
            let pos = ExtensionManager.GetTransformedPosition(iter, extensionsPos);
            room.createConstructionSite(pos[0], pos[1], STRUCTURE_EXTENSION);
        }
    },

    GetTransformedPosition: (posIndex, extensionsPos) =>
    {
        let pos = ExtensionManager.POSITIONS[posIndex];
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

module.exports = ExtensionManager;
