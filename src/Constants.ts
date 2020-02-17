export const ROOM_SIZE = 50
export const SHORT_TIME = CREEP_LIFE_TIME / 100
export const MEDIUM_TIME = CREEP_LIFE_TIME / 50
export const DIRECTIONS = [[TOP_LEFT, TOP, TOP_RIGHT], [LEFT, undefined, RIGHT], [BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT]]

export function Sum(object: { [key: string]: number }): number {
    let sum: number = 0
    for (let key in object)
    {
        sum += object[key]
    }
    return sum
}
