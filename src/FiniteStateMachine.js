class FiniteStateMachine {
  constructor (transitionArray) {
    this.transitions = transitionArray.reduce((dict, transition) => {
      if (dict[transition.from]) {
        dict[transition.from].push(transition)
      } else {
        dict[transition.from] = [transition]
      }
      return dict
    }, {})
  }

  TryTransition (state, args) {
    let possibleTransitions = this.transitions[state]
    for (let transitionIter in possibleTransitions) {
      if (possibleTransitions[transitionIter].CanTransition(args)) {
        return possibleTransitions[transitionIter].to
      }
    }
    return state
  }
}

module.exports = FiniteStateMachine
