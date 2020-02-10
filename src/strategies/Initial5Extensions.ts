import { Strategy } from './Strategy';
import { ExtensionManager } from 'ExtensionManager';

export class Initial5Extensions {
    static Initialize(strategy: Strategy) {
        ExtensionManager.PlaceExtensions(
            Game.rooms[strategy.roomName],
            0,
            5,
            strategy.extensionsPos,
            strategy.extensionsOrientation)
    }
}
