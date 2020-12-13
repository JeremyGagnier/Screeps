import { MemoryManager } from "./MemoryManager"

let memoryPos: number = 0

export class MemoryMapper {
    initialPosition: number
    size: number = 0
    getMapping: { [name: string]: () => any } = {}
    setMapping: { [name: string]: (value: any) => void } = {}

    constructor() {
        this.initialPosition = memoryPos
    }

    addInt(name: string): MemoryMapper {
        this.getMapping["get" + name] = () => MemoryManager.getInt(this.initialPosition + this.size)
        this.setMapping["set" + name] = value => MemoryManager.setInt(this.initialPosition + this.size, value)
        this.size += 2
        return this
    }

    addFloat(name: string): MemoryMapper {
        this.getMapping["get" + name] = () => MemoryManager.getFloat(this.initialPosition + this.size)
        this.setMapping["set" + name] = value => MemoryManager.setFloat(this.initialPosition + this.size, value)
        this.size += 2
        return this
    }

    addPosition(name: string): MemoryMapper {
        this.getMapping["get" + name] = () => MemoryManager.getPosition(this.initialPosition + this.size)
        this.setMapping["set" + name] = value => MemoryManager.setPosition(this.initialPosition + this.size, value)
        this.size += 1
        return this
    }

    addPositionWithOrientation(name: string): MemoryMapper {
        this.getMapping["get" + name] = () => MemoryManager.getPositionWithOrientation(this.initialPosition + this.size)
        this.setMapping["set" + name] = value => MemoryManager.setPositionWithOrientation(this.initialPosition + this.size, value)
        this.size += 1
        return this
    }
}
