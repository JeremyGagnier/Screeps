let BuildJob =
{
    Construct: (targetPosition, sourcePosition, structureType) =>
    {
        return {
            type: JOB_BUILD,
            targetPosition: targetPosition,
            sourcePosition: sourcePosition,
            structureType: structureType,
            started: false,
            inProgress: false
        };
    },
    
    CanStart: (job, room) =>
    {
        return (room.createConstructionSite(
            job.targetPosition.x,
            job.targetPosition.y,
            job.structureType) === 0);
    }
}

module.exports = BuildJob;
