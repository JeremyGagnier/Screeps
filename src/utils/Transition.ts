export class Transition<T> {
    constructor(readonly from: number, readonly to: number, readonly cond: (entity: T) => boolean) {}
}
