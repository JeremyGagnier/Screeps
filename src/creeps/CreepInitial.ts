import { CreepBase } from './CreepBase'
import { CreepManager } from './CreepManager'
import { FiniteStateMachine } from '../utils/FiniteStateMachine'
import { ROOM_SIZE, Sum } from '../Constants'
import { StrategyData } from 'strategies/Strategy'
import { Transition } from '../utils/Transition'

enum InitialState {
    IDLE,
    MOVE,
    MINE,
    TRANSFER,
    DIE,
    BUILD
}

enum InitialJob {
    NONE,
    MINE,
    HAUL,
    BUILD,
    DIE,
    UPGRADE
}

export class CreepInitial extends CreepBase {

    static fsm: FiniteStateMachine<CreepInitial> = new FiniteStateMachine(InitialState, [
        [InitialState.IDLE, CreepInitial.Idle],
        [InitialState.MOVE, CreepInitial.Move],
        [InitialState.MINE, CreepInitial.Mine],
        [InitialState.TRANSFER, CreepInitial.Transfer],
        [InitialState.DIE, CreepInitial.Die],
        [InitialState.BUILD, CreepInitial.Build]
    ], [
        new Transition(InitialState.MOVE, InitialState.MINE, CreepInitial.FromMoveToHarvest),
        new Transition(InitialState.MOVE, InitialState.TRANSFER, CreepInitial.FromMoveToTransfer),
        new Transition(InitialState.MOVE, InitialState.DIE, CreepInitial.FromMoveToDie),
        new Transition(InitialState.MOVE, InitialState.BUILD, CreepInitial.FromMoveToBuild),

        new Transition(InitialState.TRANSFER, InitialState.IDLE, CreepInitial.FromTransferToIdle),
        new Transition(InitialState.MINE, InitialState.IDLE, CreepInitial.FromMineToIdle),
        new Transition(InitialState.BUILD, InitialState.IDLE, CreepInitial.FromBuildToIdle)
    ])

    constructor(
        public name: string,
        public targetPosition: number = -1,
        public jobPosition: number = -1,
        public job: InitialJob = InitialJob.NONE,
        public state: InitialState = InitialState.IDLE) {

        super(name)
        CreepManager.AddCreep(this)
    }

    // This is a bad solution.
    static Creep(creep: CreepInitial): Creep {
        return Game.creeps[creep.name]
    }

    static Advance(creep: CreepInitial): void {
        // Return early if this creep hasn't spawned yet.
        if (CreepInitial.Creep(creep) === undefined) {
            return
        }

        const previousState = creep.state
        const newState = CreepInitial.fsm.TryTransition(creep.state, creep)
        // Don't change the state if it was modified by a method called in TryTransition.
        if (previousState === creep.state) {
            creep.state = newState
        }
    }

    static Idle(creep: CreepInitial) {
        const strategiesLength = Memory.strategy.length
        const roomName = CreepInitial.Creep(creep).room.name
        for (let strategiesIter = 0; strategiesIter < strategiesLength; ++strategiesIter) {
            const strategyData: StrategyData = Memory.strategy[strategiesIter]
            if (strategyData.roomName === roomName) {
                strategyData.idleCreeps.push(creep)
                return
            }
        }
    }

    static Move(creep: CreepInitial) {
        if (CreepInitial.Creep(creep).fatigue <= 0) {
            const targetX = creep.targetPosition % ROOM_SIZE
            const targetY = ~~(creep.targetPosition / ROOM_SIZE)
            CreepInitial.Creep(creep).moveTo(targetX, targetY)
        }
    }

    static Mine(creep: CreepInitial) {
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const sources = CreepInitial.Creep(creep).room.lookForAt(LOOK_SOURCES, targetX, targetY)
        if (sources.length === 0 || CreepInitial.Creep(creep).harvest(sources[0]) !== OK) {
            creep.state = InitialState.IDLE
        }
    }

    static Transfer(creep: CreepInitial) {
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const targets = CreepInitial.Creep(creep).room.lookForAt(LOOK_STRUCTURES, targetX, targetY)
        for (let targetIter in targets) {
            let target = targets[targetIter]
            if (target instanceof StructureSpawn) {
                let spawn = target as StructureSpawn
                if (spawn.energy >= spawn.energyCapacity) {
                    creep.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureLink) {
                let link = target as StructureLink
                if (link.energy >= link.energyCapacity) {
                    creep.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureContainer) {
                let container = target as StructureContainer
                if (Sum(container.store) >= container.storeCapacity) {
                    creep.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureStorage) {
                let storage = target as StructureStorage
                if (Sum(storage.store) >= storage.storeCapacity) {
                    creep.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureTerminal) {
                let terminal = target as StructureTerminal
                if (Sum(terminal.store) >= terminal.storeCapacity) {
                    creep.state = InitialState.IDLE
                    return
                }
            } else if (!(target instanceof StructureController)) {
                // If no holding structure (or room controller) found keep looking
                continue
            }
            // Otherwise transfer to the non full structure
            if (CreepInitial.Creep(creep).transfer(target, RESOURCE_ENERGY) !== OK) {
                creep.state = InitialState.IDLE
            }
            return
        }
        // If no containers are found become idle
        creep.state = InitialState.IDLE
    }

    static Die(creep: CreepInitial) {
        CreepInitial.Creep(creep).suicide()
    }

    static Build(creep: CreepInitial) {
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const targets = CreepInitial.Creep(creep).room.lookForAt(LOOK_CONSTRUCTION_SITES, targetX, targetY)
        if (targets.length === 0 || CreepInitial.Creep(creep).build(targets[0]) !== OK) {
            creep.state = InitialState.IDLE
        }
    }

    static FromMoveToHarvest(creep: CreepInitial): boolean {
        const shouldTransition: boolean = creep.job === InitialJob.MINE &&
            !CreepInitial.IsFull(CreepInitial.Creep(creep)) &&
            CreepInitial.DistanceToTarget(CreepInitial.Creep(creep), creep.targetPosition) <= 0
        if (shouldTransition) {
            creep.targetPosition = creep.jobPosition
        }
        return shouldTransition
    }

    static FromMoveToTransfer(creep: CreepInitial): boolean {
        const haulFinished = creep.job === InitialJob.HAUL &&
            !CreepInitial.IsEmpty(CreepInitial.Creep(creep)) &&
            CreepInitial.DistanceToTarget(CreepInitial.Creep(creep), creep.targetPosition) <= 1
        const upgrading = creep.job === InitialJob.UPGRADE &&
            !CreepInitial.IsEmpty(CreepInitial.Creep(creep)) &&
            CreepInitial.DistanceToTarget(CreepInitial.Creep(creep), creep.targetPosition) <= 3
        return haulFinished || upgrading
    }

    static FromMoveToBuild(creep: CreepInitial): boolean {
        return creep.job === InitialJob.BUILD &&
            CreepInitial.DistanceToTarget(CreepInitial.Creep(creep), creep.targetPosition) <= 3
    }

    static FromMoveToDie(creep: CreepInitial): boolean {
        return creep.job === InitialJob.DIE &&
            CreepInitial.DistanceToTarget(CreepInitial.Creep(creep), creep.targetPosition) === 0
    }

    static FromTransferToIdle(creep: CreepInitial): boolean {
        return CreepInitial.IsEmpty(CreepInitial.Creep(creep))
    }

    static FromMineToIdle(creep: CreepInitial): boolean {
        let shouldTransition = CreepInitial.IsFull(CreepInitial.Creep(creep))
        if (shouldTransition) {
            creep.jobPosition = -1
        }
        return shouldTransition
    }

    static FromBuildToIdle(creep: CreepInitial): boolean {
        return CreepInitial.IsEmpty(CreepInitial.Creep(creep))
    }

    static SetMineJob(creep: CreepInitial, sourcePos: number, harvestPos: number) {
        creep.state = InitialState.MOVE
        creep.job = InitialJob.MINE
        creep.targetPosition = harvestPos
        creep.jobPosition = sourcePos
    }

    static SetHaulJob(creep: CreepInitial, transferPos: number) {
        creep.state = InitialState.MOVE
        creep.job = InitialJob.HAUL
        creep.targetPosition = transferPos
    }

    static SetUpgradeJob(creep: CreepInitial, transferPos: number) {
        creep.state = InitialState.MOVE
        creep.job = InitialJob.UPGRADE
        creep.targetPosition = transferPos
    }

    static SetBuildJob(creep: CreepInitial, buildPos: number) {
        creep.state = InitialState.MOVE
        creep.job = InitialJob.BUILD
        creep.targetPosition = buildPos
    }

    static SetDieJob(creep: CreepInitial, diePos: number) {
        creep.state = InitialState.MOVE
        creep.job = InitialJob.DIE
        creep.targetPosition = diePos
    }
}
