class Transition
{
    constructor(from, to, Condition)
    {
        this.from = from;
        this.to = to;
        this.Condition = Condition;
    }

    CanTransition(args)
    {
        return this.Condition(args);
    }
}

module.exports = Transition;
