import { Transition } from './Transition'

export class FiniteStateMachine<T> {

    private actions: ((entity: T) => void)[] = []

    constructor(
        enumObject: { [s: number]: string },
        stateToAction: [number, (entity: T) => void][],
        private transitionArray: Transition<T>[]) {
        let sortedActions = stateToAction.sort((a, b) => a[0] - b[0])
        const sortedActionsLength = sortedActions.length
        for (let i = 0; i < sortedActionsLength; ++i) {
            if (sortedActions[i][0] !== i || !(sortedActions[i][0] in enumObject)) {
                console.log("WARNING: An FSM is not configured properly")
                return
            }
            this.actions.push(sortedActions[i][1])
        }
    }

    public TryTransition(state: number, entity: T): number {
        const transitionArrayLength = this.transitionArray.length
        for (let transitionArrayIter = 0; transitionArrayIter < transitionArrayLength; ++transitionArrayIter) {
            const transition = this.transitionArray[transitionArrayIter]
            if (transition.from === state && transition.cond(entity)) {
                this.actions[transition.to](entity)
                return transition.to
            }
        }
        this.actions[state](entity)
        return state
    }
}
