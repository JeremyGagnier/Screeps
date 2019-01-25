let SpawnManager =
  {
    GetSpawnDirection: (spawnerPos) => {
      switch (spawnerPos.orientation) {
        case 0: return [BOTTOM]
        case 1: return [LEFT]
        case 2: return [TOP]
        case 3: return [RIGHT]
      }
    },

    GetRoadPosition: (spawnerPos) => {
      switch (spawnerPos.orientation) {
        case 0: return [spawnerPos.x, spawnerPos.y + 1]
        case 1: return [spawnerPos.x - 1, spawnerPos.y]
        case 2: return [spawnerPos.x, spawnerPos.y - 1]
        case 3: return [spawnerPos.x + 1, spawnerPos.y]
      }
    },

    GetBlockedPositions: (spawnerPos) => {
      let deltaX, deltaY
      switch (spawnerPos.orientation) {
        case 0:
          deltaX = 0
          deltaY = 1
          break
        case 1:
          deltaX = 1
          deltaY = 0
          break
        case 2:
          deltaX = 0
          deltaY = -1
          break
        case 3:
          deltaX = -1
          deltaY = 0
          break
      }
      return [
        [spawnerPos.x + deltaX - 1, spawnerPos.y + deltaY - 1],
        [spawnerPos.x + deltaX, spawnerPos.y + deltaY - 1],
        [spawnerPos.x + deltaX + 1, spawnerPos.y + deltaY - 1],
        [spawnerPos.x + deltaX - 1, spawnerPos.y + deltaY],
        [spawnerPos.x + deltaX, spawnerPos.y + deltaY],
        [spawnerPos.x + deltaX + 1, spawnerPos.y + deltaY],
        [spawnerPos.x + deltaX - 1, spawnerPos.y + deltaY + 1],
        [spawnerPos.x + deltaX, spawnerPos.y + deltaY + 1],
        [spawnerPos.x + deltaX + 1, spawnerPos.y + deltaY + 1]
      ]
    }
  }

module.exports = SpawnManager
