import { ROOM_SIZE } from "Constants"
import { RoomID } from "./RoomID"

export class PositionWithOrientation {
    value: number
    constructor(x: number, y: number, orientation: number) {
        this.value = ((x + y * ROOM_SIZE) << 2) + orientation
        if (orientation < 0 || orientation >= 4) {
            console.log("Orientation is out of bounds: " + orientation.toString())
        }
        if (this.value < 0 || this.value >= (ROOM_SIZE * ROOM_SIZE) << 2 + 3) {
            console.log("Position with orientation size out of bounds: " + this.value.toString())
        }
    }

    static fromRoomPosition(pos: RoomPosition): PositionWithOrientation {
        return new PositionWithOrientation(pos.x, pos.y * ROOM_SIZE, 0)
    }

    static deserialize(value: string): PositionWithOrientation {
        return new PositionWithOrientation(value.charCodeAt(0), 0, 0)
    }

    toRoomPosition(roomID: RoomID): RoomPosition {
        return new RoomPosition(this.x(), this.y(), roomID.roomName())
    }

    serialize(): string {
        return String.fromCharCode(this.value)
    }

    x(): number {
        return (this.value >> 2) % ROOM_SIZE
    }

    y(): number {
        return ~~((this.value >> 2) / ROOM_SIZE)
    }

    orientation(): number {
        return this.value & 0x3
    }
}
