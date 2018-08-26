let HarvestJob = function HarvestJob(targetPosition, harvestPositions)
{
    this.type = JOB_HARVEST;
    this.targetPosition = targetPosition;
    this.harvestPositions = harvestPositions;
    this.takenPositions = 0;
};

module.exports = HarvestJob;
