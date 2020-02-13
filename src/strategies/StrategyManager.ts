import { FiniteStateMachine } from '../utils/FiniteStateMachine'
import { FirstContainer } from './FirstContainer'
import { Initial5Extensions } from './Initial5Extensions'
import { InitialRCL2 } from './InitialRCL2'
import { Intel } from '../Intel'
import { SHORT_TIME } from '../Constants'
import { Strategy, StrategyType } from './Strategy'
import { Transition } from '../utils/Transition'

export class StrategyManager {

    private static fsm: FiniteStateMachine<Strategy> = new FiniteStateMachine(
        StrategyType,
        [
            [StrategyType.INITIAL_RCL_2, InitialRCL2.Advance],
            [StrategyType.INITIAL_5_EXTENSIONS, Initial5Extensions.Advance],
            [StrategyType.FIRST_CONTAINER, FirstContainer.Advance]
        ],
        [
            new Transition(
                StrategyType.INITIAL_RCL_2,
                StrategyType.INITIAL_5_EXTENSIONS,
                InitialRCL2.FromInitialRcl2ToInitial5Extensions),
            new Transition(
                StrategyType.INITIAL_5_EXTENSIONS,
                StrategyType.FIRST_CONTAINER,
                Initial5Extensions.FromInitial5ExtensionsToFirstContainer)
        ])

    static Advance() {
        // TODO: Is this room scanning necessary? Could probably be triggered other ways.
        /*
        // Scan for new rooms every now and then
        if ((Game.time % SHORT_TIME) === 0) {
            const rooms: string[] = Object.keys(Game.rooms)
            const roomsLength = rooms.length
            for (let roomsIter = 0; roomsIter < roomsLength; ++roomsIter) {
                const roomName = rooms[roomsIter]
                if (Memory.intel[roomName] === undefined) {
                    Memory.intel[roomName] = new Intel(roomName)
                }
            }
        }*/

        const strategiesLength = Memory.strategy.length
        for (let i = 0; i < strategiesLength; ++i) {
            const data: Strategy = Memory.strategy[i]
            data.type = this.fsm.TryTransition(data.type, data)
        }
    }
}
