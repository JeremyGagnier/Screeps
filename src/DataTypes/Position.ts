import { ROOM_SIZE } from "Constants"

export class Position {
    value: number
    constructor(x: number, y: number) {
        this.value = x + y * ROOM_SIZE
        if (this.value < 0 || this.value >= ROOM_SIZE * ROOM_SIZE) {
            console.log("Position size out of bounds: " + this.value.toString())
        }
    }
    
    static fromRoomPos(pos: RoomPosition): Position {
        return new Position(pos.x, pos.y * ROOM_SIZE)
    }

    static deserialize(value: string): Position {
        return new Position(value.charCodeAt(0), 0)
    }

    serialize(): string {
        return String.fromCharCode(this.value)
    }

    x(): number {
        return this.value % ROOM_SIZE
    }

    y(): number {
        return ~~(this.value / ROOM_SIZE)
    }
}
