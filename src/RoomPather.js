
let RoomPather =
{
    GetSourceContainerPositions: (roomName) =>
    {
        let roomIntel = Memory.intel[roomName];
        let room = Game.rooms[roomName];
        let spawner = room.lookForAt(LOOK_STRUCTURES, roomIntel.spawnerPos.x, roomIntel.spawnerPos.y)[0];

        let paths = [];
        for (let sourceIter in roomIntel.sourcePositions)
        {
            paths.push(PathFinder.search())
        }
    }
};

module.exports = RoomPather;
