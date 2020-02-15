import { CreepInitial, InitialState } from '../creeps/CreepInitial'
import { CreepManager } from '../creeps/CreepManager'
import { Initial5Extensions } from './Initial5Extensions'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'
import { Strategy } from './Strategy'
import { SpawnManager } from '../SpawnManager'

export class ContainerPerSource {

    static Initialize(strategy: Strategy): void {
        const intel: Intel = Memory.intel[strategy.roomName]

        const oldestToYoungestCreeps = Array.from(Memory.initialCreeps).sort((a: CreepInitial, b: CreepInitial) => {
            return (CreepInitial.Creep(a).ticksToLive || 0) - (CreepInitial.Creep(b).ticksToLive || 0)
        })

        let totalHarvestPositionsCount: number = 0
        for (let harvestPossIter in intel.harvestPoss) {
            totalHarvestPositionsCount += intel.harvestPoss[harvestPossIter].length
        }

        const containerPos = SpawnManager.GetLinkPosition(strategy.spawnPos, strategy.spawnOrientation)
        const creepsToKill: number = Memory.initialCreeps.length - totalHarvestPositionsCount - 1
        for (let initialCreepsIter = 0; initialCreepsIter < creepsToKill; ++initialCreepsIter) {
            CreepInitial.SetDieJob(Memory.initialCreeps[initialCreepsIter], containerPos)
        }
    }

    static WhenSpawnFull(creep: CreepInitial, room: Room, strategy: Strategy): void {
        let intel: Intel = Memory.intel[strategy.roomName]
        let gameCreep: Creep = CreepInitial.Creep(creep)

        let containerDistance: number = ROOM_SIZE
        let containerPosition: number | undefined
        for (let harvestPossIter in intel.harvestPoss) {
            let pos: number = intel.harvestPoss[harvestPossIter][0]
            let dist: number = Math.max(
                Math.abs(gameCreep.pos.x - (pos % ROOM_SIZE)),
                Math.abs(gameCreep.pos.y - ~~(pos / ROOM_SIZE)))
            if (!strategy.finishedContainers.includes(pos) && dist < containerDistance) {
                containerDistance = dist
                containerPosition = pos
            }
        }

        if (containerPosition) {
            let maybeContainer = room.lookForAt(
                LOOK_CONSTRUCTION_SITES,
                containerPosition % ROOM_SIZE,
                ~~(containerPosition / ROOM_SIZE))[0]

            if (maybeContainer) {
                CreepInitial.SetBuildJob(creep, maybeContainer.pos.x + ROOM_SIZE * maybeContainer.pos.y)
            } else if (containerPosition !== null) {
                strategy.finishedContainers.push(containerPosition)
                if (room.controller) {
                    CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
                } else {
                    console.log("Somehow this room (" + room.name + ") has no controller!")
                }
            }
        } else if (room.controller) {
            CreepInitial.SetUpgradeJob(creep, room.controller.pos.x + ROOM_SIZE * room.controller.pos.y)
        } else {
            console.log("Somehow this room (" + room.name + ") has no controller!")
        }
    }

    static Advance(strategy: Strategy): void {
        const room: Room = Game.rooms[strategy.roomName]
        const intel: Intel = Memory.intel[strategy.roomName]
        const spawn = Strategy.GetSpawn(strategy, room)

        const harvestJobs: [number, number][] = []
        const sourcePossLength = intel.sourcePoss.length
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                const harvesterName = strategy.initialHarvesters[sourcePosIter][harvestPosIter]
                if (harvesterName === null || Game.creeps[harvesterName] === undefined) {
                    strategy.initialHarvesters[sourcePosIter][harvestPosIter] = null
                    harvestJobs.push([sourcePosIter, harvestPosIter])
                }
            }
        }

        var stillIdleCreeps: CreepInitial[] = []
        let creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        while (creep) {
            if (CreepInitial.IsEmpty(CreepInitial.Creep(creep))) {
                stillIdleCreeps.push(creep)
            } else {
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    ContainerPerSource.WhenSpawnFull(creep, room, strategy)
                } else if (spawn) {
                    CreepInitial.SetHaulJob(creep, spawn.pos.x + spawn.pos.y * ROOM_SIZE)
                } else {
                    console.log("Somehow this room (" + room.name + ") has no spawn!")
                }
            }
            creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        }

        const notIdleCreeps: Set<string> = new Set()
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                const harvesterName = strategy.initialHarvesters[sourcePosIter][harvestPosIter]
                if (harvesterName) {
                    const creep = CreepManager.GetCreepInitial(harvesterName)
                    if (creep.state === InitialState.IDLE && CreepInitial.IsEmpty(CreepInitial.Creep(creep))) {
                        CreepInitial.SetMineJob(
                            creep,
                            intel.sourcePoss[sourcePosIter],
                            intel.harvestPoss[sourcePosIter][harvestPosIter])
                        notIdleCreeps.add(harvesterName)
                    }
                }
            }
        }

        const oldIdleCreeps: CreepInitial[] = stillIdleCreeps
        stillIdleCreeps = []
        for (let creepIter in oldIdleCreeps) {
            const creep: CreepInitial = oldIdleCreeps[creepIter]
            if (!notIdleCreeps.has(creep.name)) {
                stillIdleCreeps.push(creep)
            }
        }

        const shouldSpawnCreep = Strategy.AssignHarvestJobs(strategy, intel, harvestJobs, stillIdleCreeps)
        if (spawn) {
            const creepsCount = Object.keys(Game.creeps).length
            Strategy.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawn)
        }
    }
}
