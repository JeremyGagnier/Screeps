StructureContainer.prototype.IsFull = function () {
  return _.sum(this.store) === this.storeCapacity
}
