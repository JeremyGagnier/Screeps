const FiniteStateMachine = require("FiniteStateMachine");
const Transition = require("Transition");

const STATE_IDLE = 0;
const STATE_MOVE = 1;
const STATE_BUILD = 2;
const STATE_BUILD_PATH = 3;
const STATE_REPAIR_PATH = 4;
const STATE_UPGRADE = 5;
const STATE_DIE = 6;

// Builders need to be able to construct buildings in arbitrary locations, upgrade the room controller, and build and
// maintain roads and containers along source paths, the spawner path, and the room controller path. They must be able
// to collect resources from a specified location.
let Builder =
{
	// TODO
}

module.exports = Builder;
