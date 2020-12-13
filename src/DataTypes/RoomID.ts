export class RoomID {
    value: number
    constructor(roomName: string) {
        const left: number = +(roomName[0] == "W")
        let up: number
        let x: number
        let y: number
        if (roomName.charCodeAt(2) > 57) {
            x = parseInt(roomName.charAt(1))
            up = +(roomName[2] == "N")
            y = parseInt(roomName.slice(3))
        } else {
            x = parseInt(roomName.slice(1, 3))
            up = +(roomName[3] == "N")
            y = parseInt(roomName.slice(4))
        }
        this.value = ((x + (y << 7)) << 2) + (up << 1) + left
    }

    roomName(): string {
        let name: string = ""
        if ((this.value & 0x0001) == 0x0001) {
            name += "W"
        } else {
            name += "E"
        }
        name += ((this.value & 0x01FC) >> 2).toString()
        if ((this.value & 0x0002) == 0x0002) {
            name += "N"
        } else {
            name += "S"
        }
        name += ((this.value & 0xFE00) >> 9).toString()
        return name
    }
}
