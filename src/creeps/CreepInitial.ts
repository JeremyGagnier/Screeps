import { CreepBase } from './CreepBase'
import { CreepManager } from './CreepManager'
import { FiniteStateMachine } from '../utils/FiniteStateMachine'
import { ROOM_SIZE, Sum } from '../Constants'
import { Strategy } from '../strategies/Strategy'
import { Transition } from '../utils/Transition'

export enum InitialState {
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

    public targetPosition: number = -1
    public jobPosition: number = -1
    public job: InitialJob = InitialJob.NONE
    public state: InitialState = InitialState.IDLE

    constructor(public name: string) {
        super(name)
        CreepManager.AddCreep(this)
    }

    static Advance(creep: CreepInitial): void {
        // Return early if this creep hasn't spawned yet.
        if (Game.creeps[creep.name] === undefined) {
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
        const gameCreep: Creep = Game.creeps[creep.name]
        if (gameCreep.fatigue <= 0) {
            gameCreep.move([TOP, LEFT, BOTTOM, RIGHT][~~(Game.time / 2) % 4])
        }
        const roomName = gameCreep.room.name
        const strategiesLength = Memory.strategy.length
        for (let strategiesIter = 0; strategiesIter < strategiesLength; ++strategiesIter) {
            const strategy: Strategy = Memory.strategy[strategiesIter]
            if (strategy.roomName === roomName) {
                strategy.idleCreeps.push(creep)
                return
            }
        }
    }

    static Move(creep: CreepInitial) {
        const gameCreep: Creep = Game.creeps[creep.name]
        if (gameCreep.fatigue <= 0) {
            const targetX = creep.targetPosition % ROOM_SIZE
            const targetY = ~~(creep.targetPosition / ROOM_SIZE)
            gameCreep.moveTo(targetX, targetY)
        }
    }

    static Mine(creep: CreepInitial) {
        const gameCreep: Creep = Game.creeps[creep.name]
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const sources = gameCreep.room.lookForAt(LOOK_SOURCES, targetX, targetY)
        if (sources.length === 0 || gameCreep.harvest(sources[0]) !== OK) {
            creep.state = InitialState.IDLE
        }
    }

    static Transfer(creep: CreepInitial) {
        const gameCreep: Creep = Game.creeps[creep.name]
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const targets = gameCreep.room.lookForAt(LOOK_STRUCTURES, targetX, targetY)
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
            if (gameCreep.transfer(target, RESOURCE_ENERGY) !== OK) {
                creep.state = InitialState.IDLE
            }
            return
        }
        // If no containers are found become idle
        creep.state = InitialState.IDLE
    }

    static Die(creep: CreepInitial) {
        Game.creeps[creep.name].suicide()
    }

    static Build(creep: CreepInitial) {
        const gameCreep: Creep = Game.creeps[creep.name]
        const targetX = creep.targetPosition % ROOM_SIZE
        const targetY = ~~(creep.targetPosition / ROOM_SIZE)
        const targets = gameCreep.room.lookForAt(LOOK_CONSTRUCTION_SITES, targetX, targetY)
        if (targets.length === 0 || gameCreep.build(targets[0]) !== OK) {
            creep.state = InitialState.IDLE
        }
    }

    static FromMoveToHarvest(creep: CreepInitial): boolean {
        const gameCreep: Creep = Game.creeps[creep.name]
        const shouldTransition: boolean = creep.job === InitialJob.MINE &&
            !CreepInitial.IsFull(gameCreep) &&
            CreepInitial.DistanceToTarget(gameCreep, creep.targetPosition) <= 0
        if (shouldTransition) {
            creep.targetPosition = creep.jobPosition
        }
        return shouldTransition
    }

    static FromMoveToTransfer(creep: CreepInitial): boolean {
        const gameCreep: Creep = Game.creeps[creep.name]
        const haulFinished = creep.job === InitialJob.HAUL &&
            !CreepInitial.IsEmpty(gameCreep) &&
            CreepInitial.DistanceToTarget(gameCreep, creep.targetPosition) <= 1
        const upgrading = creep.job === InitialJob.UPGRADE &&
            !CreepInitial.IsEmpty(gameCreep) &&
            CreepInitial.DistanceToTarget(gameCreep, creep.targetPosition) <= 3
        return haulFinished || upgrading
    }

    static FromMoveToBuild(creep: CreepInitial): boolean {
        return creep.job === InitialJob.BUILD &&
            CreepInitial.DistanceToTarget(Game.creeps[creep.name], creep.targetPosition) <= 3
    }

    static FromMoveToDie(creep: CreepInitial): boolean {
        return creep.job === InitialJob.DIE &&
            CreepInitial.DistanceToTarget(Game.creeps[creep.name], creep.targetPosition) === 0
    }

    static FromTransferToIdle(creep: CreepInitial): boolean {
        return CreepInitial.IsEmpty(Game.creeps[creep.name])
    }

    static FromMineToIdle(creep: CreepInitial): boolean {
        let shouldTransition = CreepInitial.IsFull(Game.creeps[creep.name])
        if (shouldTransition) {
            creep.jobPosition = -1
        }
        return shouldTransition
    }

    static FromBuildToIdle(creep: CreepInitial): boolean {
        return CreepInitial.IsEmpty(Game.creeps[creep.name])
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
