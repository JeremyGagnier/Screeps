const ExtensionManager = require('ExtensionManager')
const SpawnManager = require('SpawnManager')

let PathManager = null
PathManager =
{
  GetSpawnerToExtensionPath: (roomName, roomIntel) => {
    let spawnerRoadPos = SpawnManager.GetRoadPosition(roomIntel.spawnerPos)
    let extensionsPos = roomIntel.extensionsPos
    let pathData = PathFinder.search(
      new RoomPosition(spawnerRoadPos[0], spawnerRoadPos[1], roomName),
      {
        pos: new RoomPosition(extensionsPos.x, extensionsPos.y, roomName),
        range: 0
      },
      {
        plainCost: 2,
        swampCost: 5,
        roomCallback: roomName => PathManager.RoomCostMatrix(extensionsPos, roomIntel.spawnerPos)
      })
    if (pathData.incomplete) {
      console.log('Failed to find a path from the spawner to the extensions in ' +
        pathData.ops.toString() +
        ' ops.')
      return null
    }
    let path = pathData.path.map(roomPos => [roomPos.x, roomPos.y])
    path.unshift(spawnerRoadPos)
    return path
  },

  GetSourcePaths: (roomName, roomIntel, spawnerToExtensionsPath) => {
    let sourcePositions = roomIntel.sourcePositions
    let extensionsPos = roomIntel.extensionsPos
    let allPaths = [spawnerToExtensionsPath]
    let paths = []
    for (let posIter in sourcePositions) {
      let sourceX = sourcePositions[posIter] % ROOM_SIZE
      let sourceY = ~~(sourcePositions[posIter] / ROOM_SIZE)
      let banned = []
      for (let harvestPositionsIter in roomIntel.harvestPositions) {
        if (harvestPositionsIter !== posIter) {
          let harvestPositions = roomIntel.harvestPositions[harvestPositionsIter]
          for (let harvestPosIter in harvestPositions) {
            let pos = harvestPositions[harvestPosIter]
            banned.push([pos % ROOM_SIZE, ~~(pos / ROOM_SIZE)])
          }
        }
      }
      let pathData = PathFinder.search(
        new RoomPosition(extensionsPos.x, extensionsPos.y, roomName),
        {
          pos: new RoomPosition(sourceX, sourceY, roomName),
          range: 1
        },
        {
          plainCost: 2,
          swampCost: 5,
          roomCallback: (roomName) => {
            PathManager.RoomCostMatrix(extensionsPos, roomIntel.spawnerPos, allPaths, banned)
          }
        })
      if (pathData.incomplete) {
        console.log('Failed to find a path from the extensions to the source at ' +
          sourceX.toString() +
          ', ' +
          sourceY.toString() +
          ' in ' +
          pathData.ops.toString() +
          ' ops.')
        paths.push(null)
      }
      let path = pathData.path.map(roomPos => [roomPos.x, roomPos.y])
      path.unshift([extensionsPos.x, extensionsPos.y])
      banned.push(path[path.length - 1])  // Prevent creating a path over a mining position
      allPaths.push(path)
      paths.push(path)
    }
    return paths
  },

  GetPath: (roomIntel, startPos, endPos, range, otherPaths, banned) => {
    let pathData = PathFinder.search(
      startPos,
      {
        pos: endPos,
        range: range
      },
      {
        plainCost: 2,
        swampCost: 5,
        roomCallback: (roomName) => {
          PathManager.RoomCostMatrix(roomIntel.extensionsPos, roomIntel.spawnerPos, otherPaths, banned)
        }
      })
    if (pathData.incomplete) {
      console.log('Failed to find a path from ' +
        startPos +
        ' to ' +
        endPos +
        ' in' +
        pathData.ops.toString() +
        ' ops.')
    }
    let path = pathData.path.map(roomPos => [roomPos.x, roomPos.y])
    path.unshift([startPos.x, startPos.y])
    return path
  },

  RoomCostMatrix: (extensionsPos, spawnerPos, paths = [], banned = []) => {
    let costs = new PathFinder.CostMatrix()

    // Block off areas around the spawn reserved for buildings
    let blockedPositions = SpawnManager.GetBlockedPositions(spawnerPos)
    for (let posIter in blockedPositions) {
      let pos = blockedPositions[posIter]
      costs.set(pos[0], pos[1], 255)
    }

    // Block off where the extensions will be built
    for (let i = 0; i < 30; ++i) {
      let pos = ExtensionManager.GetTransformedPosition(i, extensionsPos)
      costs.set(pos[0], pos[1], 255)
    }

    // Incentivize re-use of roads
    for (let pathIter in paths) {
      let path = paths[pathIter]
      for (let posIter in path) {
        let pos = path[posIter]
        costs.set(pos[0], pos[1], 1)
      }
    }

    for (let bannedPosIter in banned) {
      let pos = banned[bannedPosIter]
      costs.set(pos[0], pos[1], 255)
    }

    return costs
  },

  PlaceRoads: (room, path, skipFirst = true, skipLast = true) => {
    let firstIndex
    if (skipFirst) {
      firstIndex = 1
    } else {
      firstIndex = 0
    }
    let lastIndex
    if (skipLast) {
      lastIndex = path.length - 1
    } else {
      lastIndex = path.length
    }
    for (let posIter = firstIndex; posIter < lastIndex; ++posIter) {
      let pos = path[posIter]
      room.createConstructionSite(pos[0], pos[1], STRUCTURE_ROAD)
    }
  }
}

module.exports = PathManager
