import { Strategy, StrategyType, StrategyData } from './Strategy';
import { InitialRCL2 } from './InitialRCL2';
import { FiniteStateMachine } from '../utils/FiniteStateMachine';
import { Intel } from '../Intel';
import { MEDIUM_TIME } from '../Constants';
import { Transition } from 'utils/Transition';

export class StrategyManager {

    private static fsm: FiniteStateMachine<StrategyData> = new FiniteStateMachine(
        StrategyType,
        [
            [StrategyType.INITIAL_RCL_2, data => InitialRCL2.Advance(data)]
        ],
        [
            new Transition(
                StrategyType.INITIAL_RCL_2,
                StrategyType.INITIAL_5_EXTENSIONS,
                data => InitialRCL2.FromInitialRcl2ToInitial5Extensions(data))
        ])

    static Advance() {
        // Scan for new rooms every now and then
        if ((Game.time % MEDIUM_TIME) === 0) {
            const rooms: string[] = Object.keys(Game.rooms)
            const roomsLength = rooms.length
            for (let roomsIter = 0; roomsIter < roomsLength; ++roomsIter) {
                const roomName = rooms[roomsIter]
                if (Memory.intel[roomName] === undefined) {
                    Memory.intel[roomName] = new Intel(roomName)
                }
            }
        }

        const strategiesLength = Memory.strategy.length
        for (let i = 0; i < strategiesLength; ++i) {
            const data: StrategyData = Memory.strategy[i]
            data.type = this.fsm.TryTransition(data.type, data)
        }
    }
}
