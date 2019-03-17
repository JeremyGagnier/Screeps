import { ROOM_SIZE } from '../Constants'
import { CreepBase } from './CreepBase'
import { FiniteStateMachine } from '../utils/FiniteStateMachine'
import { CreepData } from './CreepData'
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

export class CreepInitialData extends CreepData {

    public targetPosition: number = -1
    public jobPosition: number = -1
    public job: InitialJob = InitialJob.NONE
    public state: InitialState = InitialState.IDLE
}

export class CreepInitial extends CreepBase {

    static fsm: FiniteStateMachine<CreepInitial> = new FiniteStateMachine(InitialState, [
        [InitialState.IDLE, creep => creep.Idle()],
        [InitialState.MOVE, creep => creep.Move()],
        [InitialState.MINE, creep => creep.Mine()],
        [InitialState.TRANSFER, creep => creep.Transfer()],
        [InitialState.DIE, creep => creep.Die()],
        [InitialState.BUILD, creep => creep.Build()]
    ], [
        new Transition(InitialState.MOVE, InitialState.MINE, creep => creep.FromMoveToHarvest()),
        new Transition(InitialState.MOVE, InitialState.TRANSFER, creep => creep.FromMoveToTransfer()),
        new Transition(InitialState.MOVE, InitialState.DIE, creep => creep.FromMoveToDie()),
        new Transition(InitialState.MOVE, InitialState.BUILD, creep => creep.FromMoveToBuild()),

        new Transition(InitialState.TRANSFER, InitialState.IDLE, creep => creep.FromTransferToIdle()),
        new Transition(InitialState.MINE, InitialState.IDLE, creep => creep.FromMineToIdle()),
        new Transition(InitialState.BUILD, InitialState.IDLE, creep => creep.FromBuildToIdle())
    ])

    public data: CreepInitialData

    constructor(data: CreepData) {
        super(data)
        this.data = data as CreepInitialData
        Memory.c[data.name] = this
    }

    Advance(): void {
        const previousState = this.data.state
        const newState = CreepInitial.fsm.TryTransition(this.data.state, this)
        // Don't change the state if it was modified by a method called in TryTransition.
        if (previousState === this.data.state) {
            this.data.state = newState
        }
    }

    Move() {
        const creep = Game.creeps[this.data.name]
        if (creep.fatigue <= 0) {
            const targetX = this.data.targetPosition % ROOM_SIZE
            const targetY = ~~(this.data.targetPosition / ROOM_SIZE)
            creep.moveTo(targetX, targetY)
        }
    }

    Mine() {
        const creep = Game.creeps[this.data.name]
        const targetX = this.data.targetPosition % ROOM_SIZE
        const targetY = ~~(this.data.targetPosition / ROOM_SIZE)
        const sources = creep.room.lookForAt(LOOK_SOURCES, targetX, targetY)
        if (sources.length === 0 || creep.harvest(sources[0]) !== OK) {
            this.data.state = InitialState.IDLE
        }
    }

    Transfer() {
        const creep = Game.creeps[this.data.name]
        const targetX = this.data.targetPosition % ROOM_SIZE
        const targetY = ~~(this.data.targetPosition / ROOM_SIZE)
        const targets = creep.room.lookForAt(LOOK_STRUCTURES, targetX, targetY)
        for (let targetIter in targets) {
            let target = targets[targetIter]
            if (target instanceof StructureSpawn) {
                let spawn = target as StructureSpawn
                if (spawn.energy >= spawn.energyCapacity) {
                    this.data.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureLink) {
                let link = target as StructureLink
                if (link.energy >= link.energyCapacity) {
                    this.data.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureContainer) {
                let container = target as StructureContainer
                if (_.sum(container.store) >= container.storeCapacity) {
                    this.data.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureStorage) {
                let storage = target as StructureStorage
                if (_.sum(storage.store) >= storage.storeCapacity) {
                    this.data.state = InitialState.IDLE
                    return
                }
            } else if (target instanceof StructureTerminal) {
                let terminal = target as StructureTerminal
                if (_.sum(terminal.store) >= terminal.storeCapacity) {
                    this.data.state = InitialState.IDLE
                    return
                }
            } else if (!(target instanceof StructureController)) {
                // If no holding structure (or room controller) found keep looking
                continue
            }
            // Otherwise transfer to the non full structure
            if (creep.transfer(target, RESOURCE_ENERGY) !== OK) {
                this.data.state = InitialState.IDLE
            }
            return
        }
        // If no containers are found become idle
        this.data.state = InitialState.IDLE
    }

    Die() {
        const creep = Game.creeps[this.data.name]
        creep.suicide()
    }

    Build() {
        const creep = Game.creeps[this.data.name]
        const targetX = this.data.targetPosition % ROOM_SIZE
        const targetY = ~~(this.data.targetPosition / ROOM_SIZE)
        const targets = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, targetX, targetY)
        if (targets.length === 0 || creep.build(targets[0]) !== OK) {
            this.data.state = InitialState.IDLE
        }
    }

    FromMoveToHarvest(): boolean {
        const creep = Game.creeps[this.data.name]
        const shouldTransition: boolean = this.data.job === InitialJob.MINE &&
            !this.IsFull(creep) &&
            this.DistanceToTarget(creep, this.data.targetPosition) <= 0
        if (shouldTransition) {
            this.data.targetPosition = this.data.jobPosition
        }
        return shouldTransition
    }

    FromMoveToTransfer(): boolean {
        const creep = Game.creeps[this.data.name]
        const haulFinished = this.data.job === InitialJob.HAUL &&
            !this.IsEmpty(creep) &&
            this.DistanceToTarget(creep, this.data.targetPosition) <= 1
        const upgrading = this.data.job === InitialJob.UPGRADE &&
            !this.IsEmpty(creep) &&
            this.DistanceToTarget(creep, this.data.targetPosition) <= 3
        return haulFinished || upgrading
    }

    FromMoveToBuild(): boolean {
        return this.data.job === InitialJob.BUILD &&
            this.DistanceToTarget(Game.creeps[this.data.name], this.data.targetPosition) <= 3
    }

    FromMoveToDie(): boolean {
        return this.data.job === InitialJob.DIE &&
            this.DistanceToTarget(Game.creeps[this.data.name], this.data.targetPosition) === 0
    }

    FromTransferToIdle(): boolean {
        return this.IsEmpty(Game.creeps[this.data.name])
    }

    FromMineToIdle(): boolean {
        let shouldTransition = this.IsFull(Game.creeps[this.data.name])
        if (shouldTransition) {
            this.data.jobPosition = -1
        }
        return shouldTransition
    }

    FromBuildToIdle(): boolean {
        return this.IsEmpty(Game.creeps[this.data.name])
    }

    SetMineJob(sourcePos: number, harvestPos: number) {
        this.data.state = InitialState.MOVE
        this.data.job = InitialJob.MINE
        this.data.targetPosition = harvestPos
        this.data.jobPosition = sourcePos
    }

    SetHaulJob(transferPos: number) {
        this.data.state = InitialState.MOVE
        this.data.job = InitialJob.HAUL
        this.data.targetPosition = transferPos
    }

    SetUpgradeJob(transferPos: number) {
        this.data.state = InitialState.MOVE
        this.data.job = InitialJob.UPGRADE
        this.data.targetPosition = transferPos
    }

    SetBuildJob(buildPos: number) {
        this.data.state = InitialState.MOVE
        this.data.job = InitialJob.BUILD
        this.data.targetPosition = buildPos
    }

    SetDieJob(diePos: number) {
        this.data.state = InitialState.MOVE
        this.data.job = InitialJob.DIE
        this.data.targetPosition = diePos
    }
}
