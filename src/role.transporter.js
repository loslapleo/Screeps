var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.transporting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transporting = false;
            creep.say('⛏️');
        }
        if (!creep.memory.transporting && creep.store.getFreeCapacity() == 0) {
            creep.memory.transporting = true;
            creep.say('🚚');
        }

        if (creep.memory.transporting) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            var sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleTransporter;