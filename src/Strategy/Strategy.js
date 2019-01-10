const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const Stage1 = require("Strategy.Stage1");
const Stage2 = require("Strategy.Stage2");
const Stage3 = require("Strategy.Stage3");
const Stage4 = require("Strategy.Stage4");
const Stage5 = require("Strategy.Stage5");
const Stage6 = require("Strategy.Stage6");
const Strategies = [Stage1, Stage2, Stage3, Stage4, Stage5, Stage6];

// Strategic states
const STATE_STAGE_1 = 0;
const STATE_STAGE_2 = 1;
const STATE_STAGE_3 = 2;
const STATE_STAGE_4 = 3;
const STATE_STAGE_5 = 4;
const STATE_STAGE_6 = 5;

let StrategyFSM;

let Strategy =
{
    Initialize: () =>
    {
        Memory.strategy = {
            state: 0,
            roomName: Object.keys(Game.rooms)[0],
            idleCreeps: [],
            creepCount: 0
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
    new Transition(STATE_STAGE_1, STATE_STAGE_2, Stage2.FromStage1ToStage2),
    new Transition(STATE_STAGE_2, STATE_STAGE_3, Stage3.FromStage2ToStage3),
    new Transition(STATE_STAGE_3, STATE_STAGE_4, Stage4.FromStage3ToStage4),
    new Transition(STATE_STAGE_4, STATE_STAGE_5, Stage5.FromStage4ToStage5),
    new Transition(STATE_STAGE_5, STATE_STAGE_6, Stage6.FromStage5ToStage6)
]);

module.exports = Strategy;
