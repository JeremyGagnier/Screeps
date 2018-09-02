const FiniteStateMachine = require("FiniteStateMachine");
const Intel = require("Intel");
const Transition = require("Transition");

const Stage1 = require("Strategy.Stage1");
const Stage2 = require("Strategy.Stage2");
const Strategies = [Stage1, Stage2];

// Strategic states
const STATE_STAGE_1 = 0;
const STATE_STAGE_2 = 1;

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
    new Transition(STATE_STAGE_1, STATE_STAGE_2, Stage1.FromStage1ToStage2)
]);

module.exports = Strategy;
