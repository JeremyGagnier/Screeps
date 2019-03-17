import { StrategyData } from './Strategy';
import { ExtensionManager } from 'ExtensionManager';

export class Initial5Extensions {
    static Initialize(data: StrategyData) {
        ExtensionManager.PlaceExtensions(
            Game.rooms[data.roomName],
            0,
            5,
            data.extensionsPos,
            data.extensionsOrientation)
    }
}
