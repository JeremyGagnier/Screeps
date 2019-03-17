import { CreepBase } from 'creeps/CreepBase';
import { ROOM_SIZE } from '../Constants';
import { Intel } from 'Intel';
import { CreepInitial, CreepInitialData } from '../creeps/CreepInitial';
import { CreepType } from '../creeps/CreepType';
import { ExtensionManager } from '../ExtensionManager';
import { Empire } from 'Empire';

export enum StrategyType {
    INITIAL_RCL_2,
    INITIAL_5_EXTENSIONS,
    FIRST_CONTAINER,
    CONTAINER_PER_SOURCE
}

export class StrategyData {

    public spawnPos: number = 0
    public spawnOrientation: number = 0
    public extensionsPos: number = 0
    public extensionsOrientation: number = 0
    public idleCreeps: CreepBase[] = []
    public initialHarvesters: (string | null)[][] = []

    constructor(public type: StrategyType, public roomName: string) {
        const room = Game.rooms[roomName]
        const spawns = room.find(FIND_MY_SPAWNS)
        if (spawns.length === 0) {
            throw new Error("No spawns found when trying to build strategy data")
        }
        const spawn = spawns[0]
        this.spawnOrientation = parseInt(spawn.name.charAt(0))
        this.spawnPos = spawn.pos.x + spawn.pos.y * ROOM_SIZE

        const extensionsPlacement = ExtensionManager.GetExtensionsPlacement(room, this.spawnPos, this.spawnOrientation)
        this.extensionsPos = extensionsPlacement[0]
        this.extensionsOrientation = extensionsPlacement[1]
        room.createFlag(
            this.extensionsPos % ROOM_SIZE,
            ~~(this.extensionsPos / ROOM_SIZE),
            this.extensionsOrientation.toString() + "extensions")
    }
}

export abstract class Strategy {

    static GetSpawn(data: StrategyData, room: Room, intel: Intel): StructureSpawn | undefined {
        return room
            .lookForAt(LOOK_STRUCTURES, data.spawnPos % ROOM_SIZE, ~~(data.spawnPos / ROOM_SIZE))
            .find(x => x instanceof StructureSpawn) as StructureSpawn | undefined
    }

    static GetHarvestJobs(data: StrategyData, intel: Intel): [number, number][] {
        const harvestJobs: [number, number][] = []
        const sourcePossLength = intel.sourcePoss.length
        for (let sourcePosIter = 0; sourcePosIter < sourcePossLength; ++sourcePosIter) {
            const harvestPossLength = intel.harvestPoss[sourcePosIter].length
            for (let harvestPosIter = 0; harvestPosIter < harvestPossLength; ++harvestPosIter) {
                const harvesterName = data.initialHarvesters[sourcePosIter][harvestPosIter]
                if (harvesterName === null ||
                    Game.creeps[harvesterName] === undefined ||
                    Memory.c[harvesterName].data.jobPosition !== intel.sourcePoss[sourcePosIter]) {
                    data.initialHarvesters[sourcePosIter][harvestPosIter] = null
                    harvestJobs.push([sourcePosIter, harvestPosIter])
                }
            }
        }
        return harvestJobs
    }

    static AssignHarvestJobs(
        data: StrategyData,
        intel: Intel,
        harvestJobs: [number, number][],
        idleCreeps: CreepInitial[]): boolean {
        const harvestJobsLength = harvestJobs.length
        for (let harvestJobsIter = 0; harvestJobsIter < harvestJobsLength; ++harvestJobsIter) {
            const creep = idleCreeps.pop()
            if (creep) {
                const job = harvestJobs[harvestJobsIter]
                creep.SetMineJob(intel.sourcePoss[job[0]], intel.harvestPoss[job[0]][job[1]])
                data.initialHarvesters[job[0]][job[1]] = creep.data.name
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
                Memory.c[creepName] = new CreepInitial(new CreepInitialData(creepName, CreepType.INITIAL))
                const empire = Memory.empire as Empire
                empire.creepCount += 1
            }
        }
    }
}
