const PathManager = require('PathManager')

const NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]

let Intel
Intel =
{
  Initialize: () => {
    Memory.intel = {}
    Intel.ScanRoom(Object.values(Game.rooms)[0])
  },

  ScanRoom: (room) => {
    let sourcePositions = []
    let harvestPositions = []
    let initialHarvesters = []
    let harvesters = []
    let haulers = []

    let sources = room.find(FIND_SOURCES)
    for (let sourceIter in sources) {
      let sourcePos = sources[sourceIter].pos
      let positions = []
      let nulls = []
      for (let iter in NEIGHBOURS) {
        let x = NEIGHBOURS[iter][0] + sourcePos.x
        let y = NEIGHBOURS[iter][1] + sourcePos.y
        if (room.lookForAt(LOOK_TERRAIN, x, y).toString() !== 'wall') {
          positions.push(x + ROOM_SIZE * y)
          nulls.push(null)
        }
      }
      sourcePositions.push(sourcePos.x + ROOM_SIZE * sourcePos.y)
      harvestPositions.push(positions)
      initialHarvesters.push(nulls)
      harvesters.push(null)
      haulers.push(null)
    }

    let flags = room.find(FIND_FLAGS)
    let extensionsPos = null
    let spawnerPos = null
    for (let flagIter in flags) {
      let flag = flags[flagIter]
      if (flag.name.includes('extension')) {
        let orientation = parseInt(flag.name.charAt(0))
        extensionsPos = { x: flag.pos.x, y: flag.pos.y, orientation: orientation }
      } else if (flag.name.includes('spawn')) {
        let orientation = parseInt(flag.name.charAt(0))
        spawnerPos = { x: flag.pos.x, y: flag.pos.y, orientation: orientation }
      }
    }

    // Flag spawner location
    if (spawnerPos === null) {
      let spawners = room.find(FIND_MY_SPAWNS)
      if (spawners.length !== 0) {
        let spawner = spawners[0]
        let orientation = parseInt(spawner.name.charAt(0))
        spawnerPos = { x: spawner.pos.x, y: spawner.pos.y, orientation: orientation }
        room.createFlag(spawner.pos.x, spawner.pos.y, orientation.toString() + 'spawn')
      }
    }

    // Find location for extensions
    if (spawnerPos !== null && extensionsPos === null) {
      extensionsPos = Intel.FindSuitableExtensionsPosition(room, spawnerPos)
      if (extensionsPos) {
        room.createFlag(extensionsPos.x, extensionsPos.y, extensionsPos.orientation.toString() + 'extension')
      }
    }

    let spawnerToExtensionsPath = PathManager.GetSpawnerToExtensionPath(room.name, extensionsPos, spawnerPos)
    let sourcePaths = PathManager.GetSourcePaths(
      room.name,
      extensionsPos,
      spawnerPos,
      sourcePositions,
      spawnerToExtensionsPath)

    for (let i in harvestPositions) {
      if (sourcePaths[i] === null) {
        continue
      }
      let pos = sourcePaths[i][sourcePaths[i].length - 1]
      let compactPos = pos[0] + pos[1] * ROOM_SIZE
      if (!harvestPositions[i].includes(compactPos)) {
        console.log("A source path doesn't go adjacent to its source, this is a bug.")
        continue
      }
      harvestPositions[i] = harvestPositions[i].filter(p => p !== compactPos)
      harvestPositions[i].unshift(compactPos)
    }

    Memory.intel[room.name] =
    {
      sourcePositions: sourcePositions,
      harvestPositions: harvestPositions,
      initialHarvesters: initialHarvesters,
      harvesters: harvesters,
      haulers: haulers,
      refiller: null,
      builders: [],
      builtExtensionsIndex: 0,

      spawnerPos: spawnerPos,
      extensionsPos: extensionsPos,
      finishedContainers: null,

      spawnerToExtensionsPath: spawnerToExtensionsPath,
      sourcePaths: sourcePaths
    }
  },

  FindSuitableExtensionsPosition: (room, spawnerPos) => {
    let spawnDeltaX, spawnDeltaY
    switch (spawnerPos.orientation) {
      case 0:
        spawnDeltaX = 0
        spawnDeltaY = -1
        break
      case 1:
        spawnDeltaX = 1
        spawnDeltaY = 0
        break
      case 2:
        spawnDeltaX = 0
        spawnDeltaY = 1
        break
      case 3:
        spawnDeltaX = -1
        spawnDeltaY = 0
        break
    }
    for (let i = 0; i < 4; ++i) {
      let orientation = (spawnerPos.orientation + 2 + i) % 4
      let left, top, originX, originY
      switch (orientation) {
        case 0:
          left = -4
          top = -12
          originX = -1
          originY = top + 9
          break
        case 1:
          left = 3
          top = -4
          originX = left
          originY = -1
          break
        case 2:
          left = -5
          top = 3
          originX = 1
          originY = top
          break
        case 3:
          left = -12
          top = -5
          originX = left + 9
          originY = 1
          break
      }
      let terrain = room.lookForAtArea(
        LOOK_TERRAIN,
        spawnerPos.y + spawnDeltaY + top,
        spawnerPos.x + spawnDeltaX + left,
        spawnerPos.y + spawnDeltaY + top + 9,
        spawnerPos.x + spawnDeltaX + left + 9,
        true)
      let isEmpty = true
      for (let tIter in terrain) {
        if (terrain[tIter].terrain === 'wall') {
          isEmpty = false
          break
        }
      }
      if (isEmpty) {
        return {
          x: spawnerPos.x + spawnDeltaX + originX,
          y: spawnerPos.y + spawnDeltaY + originY,
          orientation: orientation
        }
      }
    }
    console.log('Failed to find a suitable location for extensions')
    return null
  }
}

module.exports = Intel
