import { CreepBase } from '../creeps/CreepBase'
import { CreepManager } from '../creeps/CreepManager'
import { CreepInitial } from '../creeps/CreepInitial'
import { Empire } from '../Empire'
import { ExtensionManager } from '../ExtensionManager'
import { Intel } from '../Intel'
import { ROOM_SIZE } from '../Constants'

export enum StrategyType {
    INITIAL_RCL_2,
    INITIAL_5_EXTENSIONS,
    FIRST_CONTAINER,
    CONTAINER_PER_SOURCE
}

export class Strategy {
    public spawnPos: number = 0
    public spawnOrientation: number = 0
    public extensionsPos: number = 0
    public extensionsOrientation: number = 0
    public idleCreeps: CreepInitial[] = []
    public initialHarvesters: (string | null)[][] = []

    public builtExtensionsIndex: number = 0

    public finishedContainers: number[] = []

    constructor(public type: StrategyType, public roomName: string) {
        const room = Game.rooms[roomName]
        const spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length === 0) {
            throw new Error("No spawns found when trying to build strategy data")
        }
        const spawn = spawns[0]
        this.spawnOrientation = parseInt(spawn.name.charAt(0)) || 0
        this.spawnPos = spawn.pos.x + spawn.pos.y * ROOM_SIZE

        const extensionsPlacement = ExtensionManager.GetExtensionsPlacement(room, this.spawnPos, this.spawnOrientation)
        this.extensionsPos = extensionsPlacement[0]
        this.extensionsOrientation = extensionsPlacement[1]
        room.createFlag(
            this.extensionsPos % ROOM_SIZE,
            ~~(this.extensionsPos / ROOM_SIZE),
            this.extensionsOrientation.toString() + "extensions")
    }

    static GetSpawn(strategy: Strategy, room: Room): StructureSpawn | undefined {
        return room
            .lookForAt(LOOK_STRUCTURES, strategy.spawnPos % ROOM_SIZE, ~~(strategy.spawnPos / ROOM_SIZE))
            .find(x => x instanceof StructureSpawn) as StructureSpawn | undefined
    }

    static GetHarvestJobs(strategy: Strategy, intel: Intel): [number, number][] {
        const harvestJobs: [number, number][] = []
        const sourcePossLength = intel.sourcePoss.length
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                const harvesterName = strategy.initialHarvesters[sourcePosIter][harvestPosIter]
                if (harvesterName === null ||
                    Game.creeps[harvesterName] === undefined ||
                    CreepManager.GetCreepInitial(harvesterName).jobPosition !== intel.sourcePoss[sourcePosIter]) {

                    strategy.initialHarvesters[sourcePosIter][harvestPosIter] = null
                    harvestJobs.push([sourcePosIter, harvestPosIter])
                }
            }
        }
        return harvestJobs
    }

    static AssignHarvestJobs(
        strategy: Strategy,
        intel: Intel,
        harvestJobs: [number, number][],
        idleCreeps: CreepInitial[]): boolean {
        const harvestJobsLength = harvestJobs.length
        for (let harvestJobsIter = 0; harvestJobsIter < harvestJobsLength; ++harvestJobsIter) {
            const creep = idleCreeps.pop()
            if (creep) {
                const job = harvestJobs[harvestJobsIter]
                CreepInitial.SetMineJob(creep, intel.sourcePoss[job[0]], intel.harvestPoss[job[0]][job[1]])
                strategy.initialHarvesters[job[0]][job[1]] = creep.name
            } else {
                return true
            }
        }
        return false
    }

    static MaybeSpawnInitialCreep(shouldSpawn: boolean, creepsCount: number, spawn: StructureSpawn): void {
        const spawnBig = (creepsCount >= 2 && spawn.energy >= 300)
        const spawnSmall = (creepsCount < 2 && spawn.energy >= 200)
        if (shouldSpawn && (spawnBig || spawnSmall)) {
            let body
            if (spawnBig) {
                body = [WORK, CARRY, WORK, MOVE]
            } else {
                body = [CARRY, WORK, MOVE]
            }
            const creepName = Game.time.toString()
            const didSpawnCreep = spawn.spawnCreep(body, creepName)
            if (didSpawnCreep === OK) {
                new CreepInitial(creepName)
                const empire = Memory.empire as Empire
                empire.creepCount += 1
            }
        }
    }

    static Advance(
        strategy: Strategy,
        whenSpawnFull: (creep: CreepInitial, room: Room, strategy: Strategy) => void): void {
        
        const room: Room = Game.rooms[strategy.roomName]
        const intel: Intel = Memory.intel[strategy.roomName]
        const spawn = Strategy.GetSpawn(strategy, room)
        const harvestJobs = Strategy.GetHarvestJobs(strategy, intel)

        const stillIdleCreeps: CreepInitial[] = []
        let creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        while (creep) {
            if (CreepInitial.IsEmpty(Game.creeps[creep.name])) {
                stillIdleCreeps.push(creep)
            } else {
                if (spawn && spawn.energy >= spawn.energyCapacity) {
                    whenSpawnFull(creep, room, strategy)
                } else if (spawn) {
                    CreepInitial.SetHaulJob(creep, spawn.pos.x + spawn.pos.y * ROOM_SIZE)
                } else {
                    console.log("Somehow this room (" + room.name + ") has no spawn!")
                }
            }
            creep = strategy.idleCreeps.pop() as CreepInitial | undefined
        }

        const shouldSpawnCreep = Strategy.AssignHarvestJobs(strategy, intel, harvestJobs, stillIdleCreeps)
        if (spawn) {
            const creepsCount = Object.keys(Game.creeps).length
            Strategy.MaybeSpawnInitialCreep(shouldSpawnCreep, creepsCount, spawn)
        }
    }
}
