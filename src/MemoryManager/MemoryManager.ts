import { Position } from "DataTypes/Position"
import { PositionWithOrientation } from "DataTypes/PositionWithOrientation"

const MAX_MEMORY: number = 256000

let currentMemory: string = ""

let updateIntCache: { [position: number]: number } = {}
let updateFloatCache: { [position: number]: number } = {}
let updatePositionCache: { [position: number]: Position } = {}
let updatePositionWithOrientationCache: { [position: number]: PositionWithOrientation } = {}

function decodeInt(position: number): number {
    const other = currentMemory.charCodeAt(position)
    const small = currentMemory.charCodeAt(position + 1)
    const sign = 1 - ((other & 0x8000) >> 14)
    const big = (other & 0x7FFF) << 16
    return (big + small) * sign
}

function encodeInt(value: number): string {
    const big = (value & 0x7FFF0000) >> 16
    const small = (value & 0x0000FFFF)
    const sign = +(value > 0) << 15
    const writeValue = String.fromCharCode(sign + big, small)
    return writeValue
}

function decodeFloat(position: number): number {
    const other = currentMemory.charCodeAt(position)
    const small = currentMemory.charCodeAt(position + 1) >> 16
    const exponent = (other & 0x7F80) >> 7
    const sign = 1 - ((other & 0x8000) >> 14)
    const big = (other & 0x7F) >> 7
    return ((big + small) << (exponent - 127)) * sign
}

function encodeFloat(value: number): string {
    var float = new Float32Array(1)
    var bytes = new Uint8Array(float.buffer)
    float[0] = value
    
}

export class MemoryManager {
    static read(): boolean {
        currentMemory = RawMemory.get()
        if (currentMemory.length != MAX_MEMORY) {
            currentMemory = String.fromCharCode(0).repeat(MAX_MEMORY)
            return true
        }
        return false
    }

    static write(): void {
        const fullCache: [number, string][] = []
        for (let key in updateIntCache) {
            fullCache.push([parseInt(key), encodeInt(updateIntCache[key])])
        }
        for (let key in updateFloatCache) {
            fullCache.push([parseInt(key), encodeFloat(updateFloatCache[key])])
        }
        for (let key in updatePositionCache) {
            fullCache.push([parseInt(key), updatePositionCache[key].serialize()])
        }
        for (let key in updatePositionWithOrientationCache) {
            fullCache.push([parseInt(key), updatePositionWithOrientationCache[key].serialize()])
        }
        const sortedCache = fullCache.sort((a, b) => a[0] - b[0])
        const sortedCacheLength = sortedCache.length
        let newMemory: string = ""
        let lastEndpoint = 0
        for (let i = 0; i < sortedCacheLength; ++i) {
            const [position, value]: [number, string] = sortedCache[i]
            newMemory += currentMemory.slice(lastEndpoint, position) + value
            lastEndpoint = newMemory.length
        }
        newMemory += currentMemory.slice(lastEndpoint)
        RawMemory.set(newMemory)
    }

    static getInt(position: number): number {
        if (updateIntCache[position] !== undefined) {
            return updateIntCache[position]
        }
        const value = decodeInt(position)
        updateIntCache[position] = value
        return value
    }

    static getFloat(position: number): number {
        if (updateFloatCache[position] !== undefined) {
            return updateFloatCache[position]
        }
        const value = decodeFloat(position)
        updateFloatCache[position] = value
        return value
    }

    static getPosition(position: number): Position {
        if (updatePositionCache[position] !== undefined) {
            return updatePositionCache[position]
        }
        const value = Position.deserialize(currentMemory[position])
        updatePositionCache[position] = value
        return value
    }

    static getPositionWithOrientation(position: number): Position {
        if (updatePositionWithOrientationCache[position] !== undefined) {
            return updatePositionWithOrientationCache[position]
        }
        const value = PositionWithOrientation.deserialize(currentMemory[position])
        updatePositionWithOrientationCache[position] = value
        return value
    }

    static setInt(position: number, value: number): void {
        updateIntCache[position] = value
    }

    static setFloat(position: number, value: number): void {
        updateFloatCache[position] = value
    }

    static setPosition(position: number, value: Position): void {
        updatePositionCache[position] = value
    }

    static setPositionWithOrientation(position: number, value: PositionWithOrientation): void {
        updatePositionWithOrientationCache[position] = value
    }


}