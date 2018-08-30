const FiniteStateMachine = require("FiniteStateMachine");
const Intel = require("Intel");
const Transition = require("Transition");

const Initial1 = require("Strategy.Initial1");
const Strategies = [Initial1];

// Strategic states
const STATE_INITIAL_1 = 0;
const STATE_INITIAL_2 = 1;

let StrategyFSM;

let Strategy =
{
    Initialize: () =>
    {
        Memory.strategy = {
            state: 0,
            roomName: Object.keys(Game.rooms)[0],
            idleCreeps: []
        };
    },

    Advance: () =>
    {
        Memory.strategy.state = StrategyFSM.TryTransition(Memory.strategy.state);
        Strategies[Memory.strategy.state].Advance();
    }
};

StrategyFSM = new FiniteStateMachine(
[
    new Transition(STATE_INITIAL_1, STATE_INITIAL_2, Initial1.FromInitial1ToInitial2)
]);

module.exports = Strategy;
