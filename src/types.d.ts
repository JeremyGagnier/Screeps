import { CreepBase } from 'creeps/CreepBase';
import { Empire } from "Empire"
import { Intel } from "Intel"
import { Strategy } from "strategies/Strategy"

interface Memory {
    c: { [creepName: string]: CreepBase }
    empire: Empire
    intel: { [roomName: string]: Intel }
    strategy: Strategy[]
}
