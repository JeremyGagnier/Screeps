Structure.prototype.IsHealthy = function()
{
    return (this.hits / this.hitsMax) >= 0.9;
};

Structure.prototype.NeedsRepair = function()
{
    return (this.hits / this.hitsMax) >= 0.5;
};
